var helper = require('../helper');
var _ = require('lodash');
var request = require('request');

var config = exports.config = {
  accessToken: null,
  revision : null,
  maxSockets: 10,
  localUsername: false,
  rollbarUsername : false,
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
  if(!config.accessToken)
    return helper.fatal('Rollbar \'accessToken\' not set');
  if(!process.env.NODE_ENV)
    return helper.fatal('Rollbar \'customerToken\' not set');
  if(!config.revision)
    return helper.fatal('Rollbar \'revision\' is the revision');
  if(config.meta && typeof config.meta !== 'object')
    return helper.fatal('Rollbar \'meta\' must be an object');
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
  var headers = {
    'Content-Type': 'application/json',
    access_token : config.accessToken,
    environment : process.env.NODE_ENV,
    revision : config.revision
  };
  var msg = {
    date: Date.now(),
    type: type,
    msg: helper.stripColors(buffer)
  };

  if(config.localUsername)
    headers.local_username = helper.hostname;

  if( config.rollbarUsername )
    headers.rollbar_username = config.rollbarUsername;

  if(config.meta)
    _.defaults(msg, config.meta);

  msg = JSON.stringify(msg, evaluator);

  stats.sent++;
  // var id = stats.sent;
  request.post({
    pool: { maxSockets: config.maxSockets },
    url: 'https://api.rollbar.com/api/1/deploy/',
    headers: headers,
    body: msg
  }, function (err, res, body) {
    if(err)
      helper.fatal('Rollbar http error: ' + err + '\n');
    else if (res.statusCode !== 200)
      helper.fatal('Rollbar error: ' + res.statusCode + ': ' + body + '\n');
    else
      stats.confirmed++;
    // helper.log('confirmed:'+stats.confirmed+'('+id+')\n');
    // helper.log(util.inspect(res, {colors:true, depth:0})+'\n');
  });
};
