var util = require('util');
var fs = require('fs');
var fse = require('fs-extra');
var request = require('request');

module.exports = function(downloadUrl, file, callback) {
  var fileStream = fs.createWriteStream(file);

  function closeStream(err) {
    if (err) {
      return fse.remove(file, function(error) {
        if (error) {
          return callback(error);
        }
        callback(err);
      });
    }

    callback(null, file);
  }

  fileStream.on('finish', closeStream);

  request.get(downloadUrl)
    .on('response', function(response) {
      console.log('Finished downloading %s. Response %j', file, response);
      if (response.statusCode !== 200) {
        throw new Error(
          util.format('Error: status code %d', response.statusCode)
        );
      }
    })
    .on('error', function(err) {
      console.error('Error downloading %s: %s', downloadUrl, err);
      fileStream.removeListener('finish', closeStream.bind(null, err));
      callback(err);
    })
    .pipe(fileStream);
};
