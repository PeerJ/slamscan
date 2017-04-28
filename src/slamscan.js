var async = require('async');
var AWS = require('aws-sdk');
var util = require('util');
var fs = require('fs');
var fse = require('fs-extra');
var config = require('config');
var temp = require('temp');
var path = require('path');
var request = require('request');
var appRoot = require('app-root-path');
var url = require('url');
var validUrl = require('valid-url');
var process = require('child_process');

module.exports = {
  getS3: function() {
    return new AWS.S3();
  },
  getSns: function() {
    return new AWS.SNS();
  },
  downloadClamscanDbFiles: function(callback) {
    var dbFiles = config.get('slamscan.clamscan-db-files');
    async.each(dbFiles, function(dbFile, next) {
      var urlPath = url.parse(dbFile);
      var filename = path.basename(urlPath.pathname);
      var file = path.join('/tmp', filename);
      console.log(file);
      fs.exists(file, function(exists) {
        console.log('%s exists: %s', file, exists);
        if (exists) {
          next();
        } else {
          module.exports.downloadUrlToFile(dbFile, file, function(err) {
            next(err);
          });
        }
      });
    }, function(err) {
      if (err) { console.log(err); }
      callback(err);
    });
  },
  initClamscan: function(callback) {
    var exe = '/var/task/bin/clamscan';
    var tmpExe = '/tmp/clamscan';
    async.waterfall([
      function(next) {
        fs.exists(tmpExe, function(exists) {
          console.log('%s exists: %s', tmpExe, exists);
          if (exists) {
            next();
          } else {
            fse.copy(exe, tmpExe, function(err) {
              next(err);
            });
          }
        });
      },
      function(next) {
        fs.chmod(tmpExe, '0755', function(err) {
          next(err);
        });
      },
    ], function(err) {
      if (err) {
        console.log(err);
      }
      callback(err);
    });
  },
  manualScan: function(file, callback) {
    var tmpExe = '/tmp/clamscan';
    var runCmd = util.format('%s -d /tmp %s', tmpExe, file);
    var v = process.exec(runCmd, function(err, stdout, stderr) {
      console.log('Ran %s. StdErr: %s Stdout: %s', runCmd, stderr, stdout);
      var isInfected = false;
      var details = false;
      if (err) {
        details = util.format('Code: %s Stack: %s', err.code, err.stack);
        err = false;
        isInfected = true;
      }
      callback(err, isInfected, details);
    });
    var s = process.spawn(tmpExe, [ '-d', '/tmp', file]);
    s.stderr.on('data', function(data) {
      console.log(data.toString());
    });
    s.stdout.on('data', function(data) {
      console.log(data.toString());
    });
    s.on('close', function(code) {
      callback(false, code !== 0, code);
    });
  },
  downloadUrlToFile: function(downloadUrl, file, callback) {
    /*jscs:disable*/
    if (!validUrl.is_uri(downloadUrl)) {
      /*jscs:enable*/
      return callback(util.format('Error: Invalid uri %s', downloadUrl));
    }

    var urlPath = url.parse(downloadUrl);
    console.info('Downloading %s -> %s', urlPath.pathname, file);
    var fileStream = fs.createWriteStream(file);

    function closeStream() {
      console.log('Finished downloading %s (stream closed)', file);
      callback(null, file);
    }

    fileStream.on('finish', closeStream);

    request.get(downloadUrl).on('error', function(err) {
      console.error('Err downloading %s. Err: %s', downloadUrl, err);
      fileStream.removeListener('finish', closeStream);
      callback(err);
    }).on('response', function(response) {
      if (response.statusCode !== 200) {
        console.error('Error downloading %s Code: %d',
          downloadUrl,
          response.statusCode
        );
        fileStream.removeListener('finish', closeStream);
        callback(util.format('Error: status code %d', response.statusCode));
      }
    }).pipe(fileStream);
  },
  download: function(s3, bucket, key, callback) {
    if (!bucket.length || !key.length) {
      return callback(util.format(
        'Error! Bucket: %s and Key: %s must be defined',
        bucket,
        key
      ));
    }
    var ext = path.extname(key);
    var tmpFile = temp.path({suffix: ext});
    console.log('Download src file s3://%s/%s to %s', bucket, key, tmpFile);
    var file = fs.createWriteStream(tmpFile);
    var save = s3.getObject({
      Bucket: bucket,
      Key: key,
    }).createReadStream().pipe(file);
    save.on('close', function() {
      callback(null, tmpFile);
    });
  },
  sns: function(sns, topicArn, bucket, key, result, details, callback) {
    sns.publish({
      TopicArn: topicArn,
      Message: JSON.stringify({
        Bucket: bucket,
        Key: key,
        Result: result,
        Details: details,
      }),
    }, function(err, data) {
      if (err) {
        console.log(err);
      }
      callback(err, data);
    });
  },
  handler: function(event, context) {
    console.log('Reading options from event:\n',
      util.inspect(event, {depth: 5})
    );

    if (typeof (event.Records) == 'undefined') {
      console.log('Unable to find event.Records event:%j', event);
      return context.done();
    }

    var topicArn = config.get('slamscan.sns-topic-arn');
    var s3 = module.exports.getS3();
    var sns = module.exports.getSns();

    async.parallel({
      dbDownload: function(next) {
        module.exports.downloadClamscanDbFiles(next);
      },
      initClamscan: function(next) {
        module.exports.initClamscan(next);
      },
    }, function(err) {
      if (err) {
        console.log('Failed to download clamscandb files. Exiting');
        return context.done(err);
      }

      async.each(event.Records, function(record, callback) {
        var bucket = record.s3.bucket.name;
        var key = record.s3.object.key;

        async.waterfall([
          function(next) {
            console.log('bucket %s key %s', bucket, key);
            module.exports.download(s3, bucket, key, function(err, tmpFile) {
              next(err, tmpFile);
            });
          },
          function(tmpFile, next) {
            module.exports.manualScan(
              tmpFile,
              function(err, isInfected, details) {
                console.log(
                    'scan isInfected %d details: %s',
                    isInfected,
                    details
                );
                next(err, isInfected, details);
              }
            );
          },
          function(isInfected, details, next) {
            console.log('sns %s isInfected %s', key, isInfected);
            module.exports.sns(
              sns,
              topicArn,
              bucket,
              key,
              isInfected,
              details,
              function(err) {
                next(err);
              }
            );
          },
        ], function(err) {
          callback(err);
        });
      }, function(err) {
        context.done();
      });
    });
  },
};

