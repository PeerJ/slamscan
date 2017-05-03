var scanFile = require('../src/scanFile');
var path = require('path');

describe('scanFile', function() {
  describe('when given EICAR-AV-Test', function() {
    it('should return a virus', function(done) {
      var eicarAvTest = path.join(__dirname, 'resources', 'EICAR-AV-Test');
      this.timeout(15000);
      scanFile(eicarAvTest, function(err, file, isInfected) {
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
