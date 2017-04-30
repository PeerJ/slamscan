var AWS = require('aws-sdk');

module.exports = function() {
  return new AWS.S3();
};
