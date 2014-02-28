

var helper = require("../helper");
var _ = require("lodash");

var config = exports.config = {
  timestamps: false,
  typestamps: false,
  log: true,
  err: true
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