var util = require('util');
var events = require('events');
var fs = require('fs');
var path = require('path');
var readline = require('readline');
var querystring = require('querystring');

var async = require('async');

var LogLine = require('./LogLine');
var Out = require('./Out');


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
        var logLine = new LogLine(self.formatExp, self.formatConfig.params, line);

        // fixme temp code for specific purpose ------

        if (!LogParser.inDateRange(logLine['date'], start, end)) return;

        // todo allow specific actions to be performed on logLine
        logLine['date'] = logLine['date'].toString();
        logLine['url'] = logLine['url'].toString();
        logLine['referrer'] = logLine['referrer'].toString();

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