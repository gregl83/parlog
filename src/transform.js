module.exports = function(logLine) {
  /*
  logLine is an object that is passed to the transform function by reference.

  All the log line data is stored in a object property called data.

  logline.data

  CAUTION: modifications made to the data property will persist when writing to the parser output file.

  A special object property called logOut exists on the logLine object.
  If set to false a logLine will NOT be included in output results.
   */
};