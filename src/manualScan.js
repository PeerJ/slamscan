var process = require('child_process');
var config = require('config');

module.exports = function(file, callback) {
  var tmpExe = config.get('clamscan.clamscan.path');
  var s = process.spawn(tmpExe, ['-d', '/tmp', file]);
  s.stderr.on('data', function(data) {
    console.log(data.toString());
  });
  s.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  s.on('close', function(code) {
    callback(false, code !== 0, code);
  });
};
