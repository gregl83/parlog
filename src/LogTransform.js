var util = require('util');
var stream = require('stream');

var LogLine = require('./LogLine');


function LogTransform(start, end, query, formatExp, formatParams, transform) {
  var self = this;

  stream.Transform.call(self, {objectMode: true});

  self._start = start;
  self._end = end;
  self._query = query;
  self._formatExp = formatExp;
  self._formatParams = formatParams;
  self._transformFunction = transform;
  self._lastLineData = '';
}


util.inherits(LogTransform, stream.Transform);


LogTransform.inDateRange = function(date, start, end) {
  if (null === start && null === end) return true;
  else if ((null !== start && date >= start) && null === end) return true;
  else if (null === start && (null !== end && date <= end)) return true;
  return (date >= start && date <= end);
};


LogTransform.prototype._transform = function(chunk, encoding, done) {
  var self = this;

  var data = chunk.toString();
  if (self._lastLineData) data = self._lastLineData + data;

  var lines = data.split('\n');
  self._lastLineData = lines.splice(lines.length-1,1)[0];

  lines.forEach(function(line) {
    var logLine = new LogLine(self._formatExp, self._formatParams, line);

    if (!LogTransform.inDateRange(logLine.data['date'], self._start, self._end)) return;

    if (self._query) {
      var query = new RegExp(self._query);
      if (!query.test(logLine.line)) return;
    }

    if ('function' === typeof self._transformFunction) self._transformFunction(logLine);

    if (logLine.logOut) self.push(logLine.propertiesToString());
  });

  done()
};


LogTransform._flush = function(done) {
  var self = this;
  if (self._lastLineData) self.push(self._lastLineData);
  self._lastLineData = null;
  done();
};

module.exports = LogTransform;