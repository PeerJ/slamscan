var sinon = require('sinon');
var request = require('request');
var config = require('config');
var fs = require('fs');
var temp = require('temp');
var downloadFileFromHttp = require('../../src/util/downloadFileFromHttp');

describe('downloadFileFromHttp', function() {
  var requestGetStub;

  beforeEach(function() {
    requestGetStub = sinon.stub(request, 'get')
      .returns(fs.createReadStream(config.get('clamscan.clamscan.path')));
  });

  afterEach(function() {
    requestGetStub.restore();
  });

  describe('when files do not exist', function() {
    it('should download files', function(done) {
      downloadFileFromHttp(
        'test://test.test/test/test',
        temp.path(),
        function(err) {
          if (err) {
            return done(err);
          }

          requestGetStub.calledOnce.should.be.exactly(true);
          done();
        }
      );
    });
  });
});
