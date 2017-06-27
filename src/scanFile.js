var config = require('config');
var Clamscan = require('clamscan');
var clamscan = new Clamscan(config.get('clamscan'));

module.exports = clamscan.is_infected.bind(clamscan);
