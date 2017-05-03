var config = require('config');
var async = require('async');
var fs = require('fs');
var fse = require('fs-extra');

module.exports = function(callback) {
  var exe = config.get('clamscan.clamscan.path');
  var tmpExe = config.get('tmp.clamscan.path');
  async.waterfall([
    function(next) {
      fs.exists(tmpExe, function(exists) {
        console.log('%s exists: %s', tmpExe, exists);
        if (exists) {
          next();
        } else {
          fse.copy(exe, tmpExe, {dereference: true}, next);
        }
      });
    },
    function(next) {
      fs.chmod(tmpExe, 0755, next);
    }
  ], callback);
};
