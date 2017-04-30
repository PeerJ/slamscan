var initClamscan = require('../src/initClamscan');
var fs = require('fs');
var fse = require('fs-extra');
var config = require('config');

var tmpClamscanPath = config.get('tmp.clamscan.path');

describe('initClamscan', function() {
  afterEach(function(done) {
    fse.remove(tmpClamscanPath, done);
  });

  it('should copy clamscan', function(done) {
    initClamscan(function(error) {
      if (error) {
        return done(error);
      }
      fs.existsSync(tmpClamscanPath).should.be.exactly(true);
      done();
    });
  });

  it('should make it world readable/executable', function(done) {
    initClamscan(function(error) {
      if (error) {
        return done(error);
      }
      fs.access(tmpClamscanPath, fs.W_OK, function(error) {
        done(error);
      });
    });
  });
});
