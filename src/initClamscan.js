var async = require('async');
var fs = require('fs');
var fse = require('fs-extra');

module.exports = function(callback) {
  var exe = '/var/task/bin/clamscan';
  var tmpExe = '/tmp/clamscan';
  async.waterfall([
    function(next) {
      fs.exists(tmpExe, function(exists) {
        console.log('%s exists: %s', tmpExe, exists);
        if (exists) {
          next();
        } else {
          fse.copy(exe, tmpExe, function(err) {
            next(err);
          });
        }
      });
    },
    function(next) {
      fs.chmod(tmpExe, '0755', function(err) {
        next(err);
      });
    }
  ], function(err) {
    if (err) {
      console.log(err);
    }
    callback(err);
  });
};
