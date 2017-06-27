var async = require('async');
var fs = require('fs');
var config = require('config');
var path = require('path');
var url = require('url');
var util = require('./util');

module.exports = function(callback) {
  async.each(config.get('db-files'), function(dbFile, next) {
    var urlPath = url.parse(dbFile);
    var filename = path.basename(urlPath.pathname);
    var file = path.join('/tmp', filename);
    fs.exists(file, function(exists) {
      console.log('%s exists: %s', file, exists);
      if (exists) {
        next();
      } else {
        util.downloadFileFromUrl(dbFile, file, next);
      }
    });
  }, callback);
};
