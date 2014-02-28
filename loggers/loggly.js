
var helper = require("../helper");
var _ = require("lodash");
var util = require('util');
var request = require('request');
var queue = [];

var config = exports.config = {
  customerToken: null,
  maxSockets: 10,
  machineName: false,
  tags: null,
  meta: null,
  log: false,
  err: false
};

var stats = {
  sent: 0,
  confirmed: 0
};

exports.configure = function() {
  if(!config.enabled)
    return;
  if(!config.customerToken)
    return helper.fatal("Loggly 'customerToken' not set");
  if(config.tags && !(config.tags instanceof Array))
    return helper.fatal("Loggly 'tags' must be an array");
  if(config.meta && typeof config.meta !== "object")
    return helper.fatal("Loggly 'meta' must be an object");
};

//evalutate functions in json objects
var evaluator = function(k,v) {
  if(typeof v === 'function') {
    v = v();
    if(v && typeof v.toString === 'function')
      return v.toString();
    else
      return undefined;
  }
  return v;
};

exports.send = function(type, buffer) {
  var msg = {
    date: Date.now(),
    type: type,
    msg: helper.stripColors(buffer)
  };

  if(config.machineName)
    msg.machineName = helper.hostname;

  if(config.meta)
    _.defaults(msg, config.meta);

  var tags = config.tags ? config.tags.slice() : [];
  tags.push('logbook-'+type);
  tags = tags.map(function(v) {
    return evaluator(null, v);
  });

  var url = util.format('https://logs-01.loggly.com/inputs/%s/tag/%s/', config.customerToken, tags.join(','));

  msg = JSON.stringify(msg, evaluator);

  stats.sent++;
  // var id = stats.sent;
  request.post({
    pool: { maxSockets: config.maxSockets },
    url: url,
    headers: { 'Content-Type': 'application/json' },
    body: msg
  }, function (err, res, body) {
    if(err)
      helper.fatal('loggly http error: ' + err + "\n");
    else if (res.statusCode !== 200)
      helper.fatal('loggly error: ' + res.statusCode + ': ' + body + "\n");
    else
      stats.confirmed++;
    // helper.log('confirmed:'+stats.confirmed+"("+id+")\n");
    // helper.log(util.inspect(res, {colors:true, depth:0})+"\n");
  });
};





