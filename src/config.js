var fs = require('fs');

function Config() {
  this.default = Config.getConfig('default');
  this.local = Config.getConfig('local');
}

Config.getConfig = function(name) {
  var config;
  try {
    config = require('../config.' + name + '.json')
  } catch (e) {
    config = {};
  }
  return config;
};

var config = new Config();

module.exports = config;