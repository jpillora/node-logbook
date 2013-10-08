
var helper = require("../helper");
var _ = require("lodash");
var fs = require('fs');
var path = require('path');
var files = {};
var config = {};

exports.defaults = {
  enabled: false,
  timestamps: true,
  typestamps: false,
  log: "./log.txt",
  err: "./err.txt"
};

_.defaults(config, exports.defaults);

exports.status = {
  enabled: false,
  log: false,
  err: false
};

exports.configure = function(c) {
  _.extend(config, c);

  if(!config.enabled)
    return;

  helper.info('file enabled (log: '+config.log+', err: '+config.err + ')');

  ['log','err'].forEach(function(type) {
    if(config[type])
      files[type] = fs.createWriteStream(config[type], { flags: 'a' });
    else
      files[type] = null;

    exports.status[type] = !!config[type];
  });
  exports.status.enabled = config.enabled;
};

exports.send = function(type, buffer) {
  if(!files[type]) return;

  var strs = [];

  if(config.typestamps || config.log === config.err)
    strs.push(type);

  if(config.timestamps)
    strs.push(helper.time());

  strs.push(helper.stripColors(buffer));


  files[type].write(strs.join(' '));
};


