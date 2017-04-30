var download = require('./download');
var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var downloadUrlToFile = require('./util/downloadUrlToFile');
var getClamscan = require('./getClamscan');
var getS3 = require('./getS3');
var getSns = require('./getSns');
var handler = require('./handler');
var initClamscan = require('./initClamscan');
var scan = require('./scan');
var sns = require('./sns');

module.exports = {
  download: download,
  downloadClamscanDbFiles: downloadClamscanDbFiles,
  downloadUrlToFile: downloadUrlToFile,
  getClamscan: getClamscan,
  getS3: getS3,
  getSns: getSns,
  handler: handler,
  initClamscan: initClamscan,
  scan: scan,
  sns: sns
};
