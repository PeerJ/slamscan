var async = require('async');
var util = require('util');
var config = require('config');
var downloadFileFromBucket = require('./downloadFileFromBucket');
var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var getClamscan = require('./getClamscan');
var getS3 = require('./getS3');
var getSns = require('./getSns');
var initClamscan = require('./initClamscan');
var scanFile = require('./scanFile');
var notifySns = require('./notifySns');

module.exports = function(event, context, callback) {
  console.log('Reading options from event:\n',
    util.inspect(event, {depth: 5})
  );

  if (typeof (event.Records) === 'undefined') {
    console.log('Unable to find event.Records event:%j', event);
    return callback();
  }

  async.parallel({
    dbDownload: downloadClamscanDbFiles,
    initClamscan: initClamscan
  }, function(err) {
    if (err) {
      console.log('Failed to download clamscandb files. Exiting');
      return callback(err);
    }

    async.each(event.Records, function(record, callback) {
      var bucket = record.s3.bucket.name;
      var key = record.s3.object.key;

      async.waterfall([
        function(next) {
          console.log('bucket %s key %s', bucket, key);
          downloadFileFromBucket(getS3(), bucket, key, function(err, tmpFile) {
            next(err, tmpFile);
          });
        },
        function(tmpFile, next) {
          scanFile(
            getClamscan(),
            tmpFile,
            function(err, details, isInfected) {
              console.log(
                'scan isInfected %d details: %s',
                isInfected,
                details
              );
              next(err, details, isInfected);
            }
          );
        },
        function(details, isInfected, next) {
          console.log('sns %s isInfected %s', key, isInfected);
          if (isInfected) {
            notifySns(
              getSns(),
              config.get('sns-topic-arn'),
              bucket,
              key,
              isInfected,
              details,
              function(err) {
                next(err);
              }
            );
          } else {
            next();
          }
        }
      ], function(err) {
        callback(err);
      });
    }, function(err) {
      callback(err);
    });
  });
};
