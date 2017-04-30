var rewire = require('rewire');
var downloadClamscanDbFiles = rewire('../src/downloadClamscanDbFiles');
var sinon = require('sinon');
var request = require('request');
var config = require('config');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var util = require('../src/util');

describe('downloadClamscanDbFiles', function() {
  var downloadUrlToFileSpy;

  beforeEach(function() {
    sinon.stub(request, 'get')
      .returns(fs.createReadStream(config.get('clamscan.clamscan.path')));
    downloadUrlToFileSpy = sinon.spy(util, 'downloadUrlToFile');
  });

  afterEach(function() {
    request.get.restore();
    config.get('db-files').forEach(function(testUrl) {
      var testUrlComponents = testUrl.split('/');
      var testFile = testUrlComponents[testUrlComponents.length - 1];
      fse.remove(path.join('/tmp', testFile));
    });
  });

  describe('when files do not exist', function() {
    it('should download files', function(done) {
      downloadClamscanDbFiles(function(err) {
        downloadUrlToFileSpy.callCount
          .should.be.exactly(config.get('db-files').length);
        done(err);
      });
    });
  });
});

