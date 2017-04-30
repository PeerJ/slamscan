var async = require('async');
var fs = require('fs');
var config = require('config');
var path = require('path');
var url = require('url');
var util = require('./util');

module.exports = function(callback) {
  var dbFiles = config.get('db-files');
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
        util.downloadUrlToFile(dbFile, file, function(err) {
          next(err);
        });
      }
    });
  }, function(err) {
    if (err) {
      console.log(err);
    }
    callback(err);
  });
};
