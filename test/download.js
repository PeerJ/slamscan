var rewire = require('rewire');
var slamscan = rewire('../src');
var sinon = require('sinon');
var fs = require('fs');

describe('download', function() {
  describe('when missing a bucket', function() {
    it('should callback with error', function(done) {
      var s3 = slamscan.getS3();
      sinon.stub(s3, 'getObject')
        .returns();
      slamscan.download(s3, '', '', function(err) {
        err.should.match(/Error/);
        done();
      });
    });
  });

  describe('when missing a key', function() {
    it('should callback with error', function(done) {
      var s3 = slamscan.getS3();
      sinon.stub(s3, 'getObject')
        .returns();
      slamscan.download(s3, 'bucket', '', function(err) {
        err.should.match(/Error/);
        done();
      });
    });
  });

  describe('when given a valid bucket and key', function() {
    it('should return a temp file', function(done) {
      var s3 = slamscan.getS3();
      var stub = sinon.stub(s3, 'getObject')
        .returns({
          createReadStream: function() {
            return fs.createReadStream(__filename);
          }
        });
      slamscan.download(s3, 'bucket', 'key', function(err) {
        stub.calledWith({
          Bucket: 'bucket',
          Key: 'key'
        }).should.be.exactly(true);
        done(err);
      });
    });
  });
});
