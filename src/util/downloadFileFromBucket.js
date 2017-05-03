var util = require('util');
var fs = require('fs');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

module.exports = function(bucket, key, file, callback) {
  if (!bucket.length || !key.length) {
    return callback(new Error(util.format(
      'Error! Bucket: %s and Key: %s must be defined',
      bucket,
      key
    )));
  }

  s3
    .getObject({
      Bucket: bucket,
      Key: key
    })
    .createReadStream()
    .pipe(fs.createWriteStream(file))
    .on('error', function(error) {
      console.log('Error downloading s3://%s/%s to %s', bucket, key, file);
      callback(error);
    })
    .on('close', function() {
      console.log('Downloaded s3://%s/%s to %s', bucket, key, file);
      callback(null, file);
    });
};
