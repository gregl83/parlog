var url = require('url');

var months = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12};


function LogLine(expression, params, line) {
  var self = this;
  self.line = line;
  self.data = {};

  // build logLine from line parts
  var lineParts = expression.exec(self.line);
  Object.keys(params).forEach(function(param, i) {
    switch(params[param]) {
      case 'date':
        var slashSplit = lineParts[(i+1)].split('/');
        var colonSplit = slashSplit[2].split(':');
        var spaceSplit = colonSplit[3].split(' ');
        self.data[param] = new Date(months[slashSplit[1]] + "/" + slashSplit[0] + "/" + colonSplit[0] + " " + colonSplit[1] + ":" + colonSplit[2] + ":" + colonSplit[3] + " " + spaceSplit[1]);
        self.data[param].toString = self.data[param].toISOString;
        break;
      case 'url':
        self.data[param] = url.parse(lineParts[(i+1)], true);
        self.data[param].toString = function(){return lineParts[(i+1)]};
        break;
      default:
        self.data[param] = lineParts[(i+1)];
        break;
    }
  });
}


LogLine.prototype.propertiesToString = function() {
  var self = this;
  var data = {};

  Object.keys(self.data).forEach(function(param, i) {
    data[param] = self.data[param].toString();
  });

  return data;
};

module.exports = LogLine;