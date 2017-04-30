var rewire = require('rewire');
var slamscan = rewire('../src');
var path = require('path');

describe('scan', function() {
  describe('when given EICAR-AV-Test', function() {
    it('should return a virus', function(done) {
      var eicarAvTest = path.join(__dirname, 'resources', 'EICAR-AV-Test');
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
