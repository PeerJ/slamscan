var util = require('util');
var url = require('url');
var validUrl = require('valid-url');
var downloadFileFromBucket = require('./downloadFileFromBucket');
var downloadFileFromHttp = require('./downloadFileFromHttp');

module.exports = function(downloadUrl, file, callback) {
  /*jscs:disable*/
  if (!validUrl.is_uri(downloadUrl)) {
    /*jscs:enable*/
    return callback(new Error(util.format('Error: Invalid uri %s', downloadUrl)));
  }

  console.log('Downloading %s to %s', downloadUrl, file);

  var parsedUrl = url.parse(downloadUrl);

  switch (parsedUrl.protocol) {
    case 's3:': {
      return downloadFileFromBucket(
        parsedUrl.hostname,
        parsedUrl.pathname.slice(1),
        file,
        callback
      );
    }

    default: {
      return downloadFileFromHttp(
        downloadUrl,
        file,
        callback
      );
    }
  }
};
