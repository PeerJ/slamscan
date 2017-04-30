var rewire = require('rewire');
var downloadClamscanDbFiles = rewire('../src/downloadClamscanDbFiles');
var sinon = require('sinon');
var request = require('request');

describe('downloadClamscanDbFiles', function() {
  beforeEach(function(done) {
    sinon.stub(request, 'get')
      .yields(null, null, JSON.stringify({woof: 'Woof!'}));
    done();
  });

  afterEach(function() {
    request.get.restore();
  });

  describe('when files do not exist', function() {
    it('should download files', function(done) {
      downloadClamscanDbFiles(function(err) {
        done(err);
      });
    });
  });
});

