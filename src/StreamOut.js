var util = require('util');
var stream = require('stream');
var fs = require('fs');

var csv = require('csv');

function StreamOut(out) {
  var self = this;

  stream.Writable.call(self, {objectMode: true});

  var file = fs.createWriteStream(out);

  self.parser = csv.stringify({});

  self.parser.on('readable', function() {
    while(row = self.parser.read()) {
      file.write(row);
    }
  });

  self.parser.on('error', function(err) {
    self.emit('error', err);
  });

  self.parser.on('finish', function() {
    file.close();
  });
}


util.inherits(StreamOut, stream.Writable);


StreamOut.prototype._write = function(chunk, enc, next) {
  this.parser.write(chunk);
  next();
};

module.exports = StreamOut;