module.exports = function(clamscan, file, callback) {
  console.log(file);
  clamscan.is_infected(file, function(err, scannedFile, isInfected) {
    if (err) {
      console.log(err);
    }
    callback(err, scannedFile, isInfected);
  });
};
