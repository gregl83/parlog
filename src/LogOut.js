var util = require('util');
var stream = require('stream');
var fs = require('fs');

var csv = require('csv');

function LogOut(output) {
  var self = this;

  stream.Writable.call(self, {objectMode: true});

  var file = fs.createWriteStream(output);

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


util.inherits(LogOut, stream.Writable);


LogOut.prototype._write = function(chunk, enc, next) {
  this.parser.write(chunk);
  next();
};

module.exports = LogOut;