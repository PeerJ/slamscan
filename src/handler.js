var async = require('async');
var util = require('util');
var config = require('config');
var download = require('./download');
var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var getS3 = require('./getS3');
var getSns = require('./getSns');
var initClamscan = require('./initClamscan');
var manualScan = require('./manualScan');
var notifyInfected = require('./sns');

module.exports = function(event, context) {
  console.log('Reading options from event:\n',
    util.inspect(event, {depth: 5})
  );

  if (typeof (event.Records) === 'undefined') {
    console.log('Unable to find event.Records event:%j', event);
    return context.done();
  }

  var topicArn = config.get('sns-topic-arn');
  var s3 = getS3();
  var sns = getSns();

  async.parallel({
    dbDownload: downloadClamscanDbFiles,
    initClamscan: initClamscan
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
          download(s3, bucket, key, function(err, tmpFile) {
            next(err, tmpFile);
          });
        },
        function(tmpFile, next) {
          manualScan(
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
          notifyInfected(
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
        }
      ], function(err) {
        callback(err);
      });
    }, function(err) {
      context.done(err);
    });
  });
};
