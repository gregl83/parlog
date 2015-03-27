var util = require('util');
var events = require('events');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var url = require('url');
var querystring = require('querystring');

var async = require('async');

var Out = require('./Out');

var months = {"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"Jun":6,"Jul":7,"Aug":8,"Sep":9,"Oct":10,"Nov":11,"Dec":12};


function LogParser(config, format) {
  var self = this;

  if ((config.local.logMatch && config.local.logMatch && 'undefined' === typeof config.local.logMatch[format]) && ('undefined' === typeof config.default.logMatch[format])) {
    return self.emit('error', 'invalid log match format');
  }

  self.config = config;

  self.logFileMatch = new RegExp(config.default.logFileMatch.filename, config.default.logFileMatch.modifiers);

  // get log format config
  var useLocalLogMatch = (config.local.logMatch && 'undefined' !== typeof config.local.logMatch[format]);
  if (useLocalLogMatch) self.formatConfig = config.local.logMatch[format];
  else self.formatConfig = config.default.logMatch[format];

  self.formatExp = new RegExp(self.formatConfig.format);
}


util.inherits(LogParser, events.EventEmitter);


LogParser.inDateRange = function(date, start, end) {
  return ((null !== start && date >= start) && (null !== end && date <= end));
};

LogParser.prototype.getLogFiles = function(directory, cb) {
  var self = this;

  // get log filenames from log directory
  fs.readdir(directory, function(err, files) {
    if (err) {
      self.emit('error', 'problem reading directory', directory, err);
      return cb(err);
    }

    var logFiles = [];

    files.forEach(function (filename) {
      if ('' !== filename.match(self.logFileMatch)[0]) {
        self.emit('debug', 'log file match', filename);
        logFiles.push(filename);
      }
    });

    cb(null, logFiles);
  });
};


LogParser.prototype.parseLogLine = function(line) {
  var self = this;
  var logLine = {};

  // build logLine from line parts
  var lineParts = self.formatExp.exec(line);
  Object.keys(self.formatConfig.params).forEach(function(param, i) {
    switch(self.formatConfig.params[param]) {
      case 'date':
        var slashSplit = lineParts[(i+1)].split('/');
        var colonSplit = slashSplit[2].split(':');
        var spaceSplit = colonSplit[3].split(' ');
        logLine[param] = new Date(months[slashSplit[1]] + "/" + slashSplit[0] + "/" + colonSplit[0] + " " + colonSplit[1] + ":" + colonSplit[2] + ":" + colonSplit[3] + " " + spaceSplit[1]);
        break;
      case 'url':
        logLine[param] = url.parse(lineParts[(i+1)], true);
        logLine[param].toString = function(){return lineParts[(i+1)]};
        break;
      default:
        logLine[param] = lineParts[(i+1)];
        break;
    }
  });

  return logLine;
};


LogParser.prototype.parse = function(directory, start, end, output) {
  var self = this;

  self.emit('info', 'parsing log directory', directory, 'file match', self.logFileMatch);

  self.getLogFiles(directory, function(err, logFiles) {
    self.emit('debug', 'parsing', logFiles.length, 'log files');

    // todo cleanup
    var out = new Out(output);
    out.write(Object.keys(self.formatConfig.params));

    var q = async.queue(function (filename, callback) {
      self.emit('debug', 'parsing log file', filename);

      var instream = fs.createReadStream(path.resolve(directory, filename));

      var rl = readline.createInterface({
        input: instream,
        terminal: false
      });

      rl.on('line', function(line) {
        var logLine = self.parseLogLine(line);

        // fixme temp code for specific purpose ------

        if (!LogParser.inDateRange(logLine['date'], start, end)) return;

        // todo allow specific actions to be performed on logLine
        logLine['date'] = logLine['date'].toISOString();
        //logLine['url'] = logLine['url'].toString();
        //logLine['referrer'] = logLine['referrer'].toString();

        // todo parse specific parts of log
        var qs = querystring.parse(logLine['url']);

        // todo match clicks only
        if ('undefined' === typeof qs.u && 'undefined' === typeof qs.q) {
          out.write(logLine);
        }

        // fixme temp code for specific purpose ------
      });

      rl.on('close', function() {
        self.emit('debug', 'done parsing log file', filename);
        callback();
      });
    }, 1);

    q.drain = function() {
      self.emit('info', 'done parsing log directory', directory, 'file match', self.logFileMatch);
    };

    q.push(logFiles);
  });
};

module.exports = LogParser;