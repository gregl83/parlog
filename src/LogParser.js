var util = require('util');
var events = require('events');
var fs = require('fs');
var path = require('path');

var async = require('async');

var LogTransform = require('./LogTransform');
var LogOut = require('./LogOut');


function LogParser() {}


util.inherits(LogParser, events.EventEmitter);


LogParser.prototype.init = function(config, format, transform) {
  var self = this;

  self.config = config;

  if (!self.config.has('logMatch.' + format)) self.emit('error', 'invalid log match format');

  self.formatConfig = self.config.get('logMatch.' + format);
  self.formatExp = new RegExp(self.formatConfig.format);
  self.logFileMatch = new RegExp(self.config.get('logFileMatch.filename'), self.config.get('logFileMatch.modifiers'));

  self.transform = null;
  if (transform) {
    try {
      self.transform = require(transform);
    } catch (e) {
      self.emit('error', 'transform function not found');
    }
  }
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


LogParser.prototype.parse = function(directory, start, end, query, output) {
  var self = this;

  self.emit('info', 'parsing log directory', directory, 'file match', self.logFileMatch);

  self.getLogFiles(directory, function(err, logFiles) {
    self.emit('debug', 'parsing', logFiles.length, 'log files');

    var logOut = new LogOut(output);
    logOut.write(Object.keys(self.formatConfig.params));

    var q = async.queue(function (filename, callback) {
      self.emit('debug', 'parsing log file', filename);

      var logFile = fs.createReadStream(path.resolve(directory, filename));

      var logTransform = new LogTransform(start, end, query, self.formatExp, self.formatConfig.params, self.transform);

      logFile.pipe(logTransform);

      logTransform.on('readable', function () {
        var line;
        while (line = logTransform.read()) {
          logOut.write(line);
        }
      });

      logTransform.on('error', function(err) {
        self.emit('parsing log file', err);
      });

      logTransform.on('finish', function() {
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