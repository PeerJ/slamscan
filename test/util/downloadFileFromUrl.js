var sinon = require('sinon');
var rewire = require('rewire');
var temp = require('temp');
var downloadFileFromBucket = require('../../src/util/downloadFileFromBucket');
var downloadFileFromHttp = require('../../src/util/downloadFileFromHttp');
var downloadFileFromUrl = rewire('../../src/util/downloadFileFromUrl');

describe('downloadFileFromUrl', function() {
  var downloadFileFromBucketStub;
  var downloadFileFromHttpStub;

  beforeEach(function() {
    downloadFileFromBucketStub = sinon.stub()
      .yields(null, 's3');
    downloadFileFromHttpStub = sinon.stub()
      .yields(null, 'http');
    downloadFileFromUrl.__set__({
      downloadFileFromBucket: downloadFileFromBucketStub,
      downloadFileFromHttp: downloadFileFromHttpStub
    });
  });

  afterEach(function() {
    downloadFileFromUrl.__set__({
      downloadFileFromBucket: downloadFileFromBucket,
      downloadFileFromHttp: downloadFileFromHttp
    });
  });

  it('should delegate to the correct function (http)', function(done) {
    downloadFileFromUrl(
      'http://test.test/test/test',
      temp.path(),
      function(error, file) {
        if (error) {
          return done(error);
        }

        file.should.be.exactly('http');
        downloadFileFromHttpStub.calledOnce.should.be.exactly(true);

        done();
      }
    );
  });

  it('should delegate to the correct function (https)', function(done) {
    downloadFileFromUrl(
      'https://test.test/test/test',
      temp.path(),
      function(error, file) {
        if (error) {
          return done(error);
        }

        file.should.be.exactly('http');
        downloadFileFromHttpStub.calledOnce.should.be.exactly(true);

        done();
      }
    );
  });

  it('should delegate to the correct function (s3)', function(done) {
    downloadFileFromUrl(
      's3://test.test/test/test',
      temp.path(),
      function(error, file) {
        if (error) {
          return done(error);
        }

        file.should.be.exactly('s3');
        downloadFileFromBucketStub.calledOnce.should.be.exactly(true);

        done();
      }
    );
  });
});
