var sinon = require('sinon');
var fs = require('fs');
var temp = require('temp');
var rewire = require('rewire');
var downloadFileFromBucket = rewire('../../src/util/downloadFileFromBucket');

describe('downloadFileFromBucket', function() {
  var s3GetObjectStub = null;

  beforeEach(function() {
    s3GetObjectStub = sinon.stub()
      .returns({
        createReadStream: function() {
          return fs.createReadStream(__filename);
        }
      });
    downloadFileFromBucket.__set__('s3', {
      getObject: s3GetObjectStub
    });
  });

  describe('when missing a bucket', function() {
    it('should callback with error', function(done) {
      downloadFileFromBucket('', '', temp.path(), function(err) {
        err.should.match(/Bucket:  /);
        s3GetObjectStub.called.should.be.exactly(false);
        done();
      });
    });
  });

  describe('when missing a key', function() {
    it('should callback with error', function(done) {
      downloadFileFromBucket('bucket', '', temp.path(), function(err) {
        err.should.match(/Key:  /);
        s3GetObjectStub.called.should.be.exactly(false);
        done();
      });
    });
  });

  describe('when given a valid bucket and key', function() {
    it('should return a temp file', function(done) {
      var stubBucketAndKey = {
        Bucket: 'bucket',
        Key: 'key'
      };
      downloadFileFromBucket(
        stubBucketAndKey.Bucket,
        stubBucketAndKey.Key,
        temp.path(),
        function(err) {
          if (err) {
            return done(err);
          }

          s3GetObjectStub.calledOnce.should.be.exactly(true);
          s3GetObjectStub.calledWith(stubBucketAndKey).should.be.exactly(true);

          done();
        }
      );
    });

    it('should `decodeURIComponent` on the key', function(done) {
      var stubBucketAndKey = {
        Bucket: 'bucket',
        Key: 'folder/file%3Awith%3Acolons'
      };
      downloadFileFromBucket(
        stubBucketAndKey.Bucket,
        stubBucketAndKey.Key,
        temp.path(),
        function(err) {
          if (err) {
            return done(err);
          }

          s3GetObjectStub.calledOnce.should.be.exactly(true);
          s3GetObjectStub.calledWith({
            Bucket: stubBucketAndKey.Bucket,
            Key: decodeURIComponent(stubBucketAndKey.Key)
          }).should.be.exactly(true);

          done();
        }
      );
    });
  });
});
