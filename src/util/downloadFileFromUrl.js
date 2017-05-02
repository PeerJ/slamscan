var util = require('util');
var fs = require('fs');
var fse = require('fs-extra');
var request = require('request');
var url = require('url');
var validUrl = require('valid-url');

module.exports = function(downloadUrl, file, callback) {
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
      fse.remove(file, function(error) {
        if (error) {
          return callback(error);
        }
        callback(util.format('Error: status code %d', response.statusCode));
      });
    }
  }).pipe(fileStream);
};
