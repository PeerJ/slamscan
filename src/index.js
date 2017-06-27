var downloadClamscanDbFiles = require('./downloadClamscanDbFiles');
var handler = require('./handler');
var scanFile = require('./scanFile');

module.exports = {
  downloadClamscanDbFiles: downloadClamscanDbFiles,
  handler: handler,
  scanFile: scanFile
};
