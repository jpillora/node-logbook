

var helper = require("../helper");
var _ = require("lodash");
var config = {};

exports.defaults = {
  enabled: true,
  timestamps: false,
  typestamps: false,
  log: true,
  err: true
};

exports.status = {
  enabled: true,
  log: true,
  err: true
};

_.defaults(config, exports.defaults);
exports.configure = function(c) {
  _.extend(config, c);
  _.extend(exports.status, _.pick(config, 'enabled', 'log', 'err'));
  if(config.enabled)
    helper.info('console enabled');
};

exports.send = function(type, buffer) {
  var strs = [];

  if(config.typestamps)
    strs.push(type === 'err' ? type.red : type.cyan);

  if(config.timestamps)
    strs.push(helper.time().grey);

  strs.push(buffer.toString());

  helper[type](strs.join(' '));
};