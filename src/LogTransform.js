var util = require('util');
var stream = require('stream');

function LogTransform(options) {
  stream.Transform.call(this, options);
}


util.inherits(LogTransform, stream.Transform);


LogTransform.prototype._transform = function(chunk, encoding, done) {
  this.push(chunk);
  done();
};

module.exports = LogTransform;