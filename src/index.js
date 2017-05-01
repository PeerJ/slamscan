var downloadFileFromBucket = require('./downloadFileFromBucket');
var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var downloadFileFromUrl = require('./util/downloadFileFromUrl');
var getClamscan = require('./getClamscan');
var getS3 = require('./getS3');
var getSns = require('./getSns');
var handler = require('./handler');
var initClamscan = require('./initClamscan');
var scanFile = require('./scanFile');
var notifySns = require('./notifySns');

module.exports = {
  downloadClamscanDbFiles: downloadClamscanDbFiles,
  downloadFileFromBucket: downloadFileFromBucket,
  downloadFileFromUrl: downloadFileFromUrl,
  getClamscan: getClamscan,
  getS3: getS3,
  getSns: getSns,
  handler: handler,
  initClamscan: initClamscan,
  notifySns: notifySns,
  scanFile: scanFile
};
