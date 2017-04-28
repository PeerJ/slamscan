var rewire = require('rewire');
var slamscan = rewire('../src/slamscan');

// No need to always run this, but useful to verify on occasion
describe('scan', function() {
  describe('when given EICAR-AV-Test', function() {
    it('should return a virus', function(done) {
      var eicarAvTest = __dirname + '/samples/EICAR-AV-Test';
      var clamscan = slamscan.getClamscan();
      this.timeout(15000);
      slamscan.scan(clamscan, eicarAvTest, function(err, file, isInfected) {
        isInfected.should.be.exactly(true);
        done(err);
      });
    });
  });
});
