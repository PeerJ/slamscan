var config = require('config');
var Clamscan = require('clamscan');

module.exports = function() {
  return new Clamscan(config.get('clamscan'));
};
