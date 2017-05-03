var util = require('util');
var fs = require('fs');
var temp = require('temp');
var path = require('path');

module.exports = function(s3, bucket, key, callback) {
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

  s3
    .getObject({
      Bucket: bucket,
      Key: key
    })
    .createReadStream()
    .pipe(file)
    .on('error', function(error) {
      console.log('Error downloading s3://%s/%s to %s', bucket, key, tmpFile);
      callback(error);
    })
    .on('close', function() {
      console.log('Downloaded s3://%s/%s to %s', bucket, key, tmpFile);
      callback(null, tmpFile);
    });
};
