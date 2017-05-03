var sinon = require('sinon');
var config = require('config');
var fs = require('fs');
var util = require('../../src/util/index');
var downloadClamscanDbFiles = require('../../src/downloadClamscanDbFiles');

describe('downloadClamscanDbFiles', function() {
  var downloadFileFromUrlStub;

  beforeEach(function() {
    downloadFileFromUrlStub = sinon.stub(util, 'downloadFileFromUrl')
      .yields('file')
      .callsArg(2);
  });

  afterEach(function() {
    downloadFileFromUrlStub.restore();
  });

  describe('when files do not exist', function() {
    it('should download files', function(done) {
      downloadClamscanDbFiles(function(err) {
        if (err) {
          return done(err);
        }
        downloadFileFromUrlStub.callCount
          .should.be.exactly(config.get('db-files').length);
        done();
      });
    });
  });

  describe('when files do exist', function() {

    beforeEach(function() {
      sinon.stub(fs, 'exists')
        .yields(true);
    });

    afterEach(function() {
      fs.exists.restore();
    });

    it('shouldn\'t download files', function(done) {
      downloadClamscanDbFiles(function(err) {
        if (err) {
          return done(err);
        }
        fs.exists.callCount
          .should.be.exactly(config.get('db-files').length);
        downloadFileFromUrlStub.notCalled
          .should.be.exactly(true);
        done();
      });
    });
  });
});
