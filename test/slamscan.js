var rewire = require('rewire');
var slamscan = rewire('../src/slamscan');
var sinon = require('sinon');
var request = require('request');
var fs = require('fs');
var path = require('path');

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

describe('scan', function() {
  describe('when given EICAR-AV-Test', function() {
    it('should return a virus', function(done) {
      var eicarAvTest = path.join(__dirname, 'samples', 'EICAR-AV-Test');
      var clamscan = slamscan.getClamscan();
      this.timeout(15000);
      slamscan.scan(clamscan, eicarAvTest, function(err, file, isInfected) {
        if (err) {
          return done(err);
        }
        file.should.be.exactly(eicarAvTest);
        isInfected.should.be.exactly(true);
        done();
      });
    });
  });
});


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
      slamscan.downloadClamscanDbFiles(function(err) {
        done(err);
      });
    });
  });
});

