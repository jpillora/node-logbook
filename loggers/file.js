
var helper = require("../helper");
var fs = require('fs');
var files = {};

var config = exports.config = {
  timestamps: true,
  typestamps: false,
  log: false,
  err: false,
  logPath: "./log.txt",
  errPath: "./err.txt"
};

exports.configure = function() {
  ['log','err'].forEach(function(type) {
    if(!config[type])
      return;
    var path = config[type+"Path"];
    if(!path)
      return helper.fatal("file: cannot enable '%s' missing 'path'", type);
    files[type] = fs.createWriteStream(path, { flags: 'a' });
  });
};

exports.send = function(type, buffer) {

  if(!files[type])
    return;

  var strs = [];

  if(config.typestamps || config.logPath === config.errPath)
    strs.push(type);

  if(config.timestamps)
    strs.push(helper.time());

  strs.push(helper.stripColors(buffer));

  files[type].write(strs.join(' '));
};


