var async = require('async');
var util = require('util');
var config = require('config');
var temp = require('temp');
var path = require('path');
var appUtil = require('./util');
var downloadFileFromBucket = appUtil.downloadFileFromBucket;
var notifySns = appUtil.notifySns;
var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var scanFile = require('./scanFile');

module.exports = function(event, context, callback) {
  console.log('Reading options from event: %j',
    util.inspect(event, {depth: 5})
  );

  if (typeof (event.Records) === 'undefined') {
    return callback(new Error(
      util.format('Unable to find event. Records event: %j', event)
    ));
  }

  async.parallel({
    downloadClamscanDbFiles: downloadClamscanDbFiles
  }, function(err) {
    if (err) {
      console.log('Failed to download clamscandb files. Exiting');
      return callback(err);
    }

    async.each(event.Records, function(record, callback) {
      var bucket = record.s3.bucket.name;
      var key = record.s3.object.key;

      async.waterfall([
        downloadFileFromBucket.bind(
          null,
          bucket,
          key,
          temp.path({suffix: path.extname(key)})
        ),
        scanFile,
        function(details, isInfected, next) {
          if (isInfected) {
            notifySns(
              config.get('sns-topic-arn'),
              JSON.stringify({
                Bucket: bucket,
                uri: util.format('s3://%s/%s', bucket, key),
                isInfected: isInfected,
                details: details
              }),
              next
            );
          } else {
            next();
          }
        }
      ], callback);
    }, callback);
  });
};
