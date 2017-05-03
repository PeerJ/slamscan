var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var handler = require('./handler');
var initClamscan = require('./initClamscan');
var scanFile = require('./scanFile');
var notifySns = require('./util/notifySns');

module.exports = {
  downloadClamscanDbFiles: downloadClamscanDbFiles,
  handler: handler,
  initClamscan: initClamscan,
  notifySns: notifySns,
  scanFile: scanFile
};
