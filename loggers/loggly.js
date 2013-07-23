
var printer = require("../printer");
var _ = require("lodash");
var util = require('util');
var request = require('request');
var queue = [];
var config = {};
var baseUrl = 'https://logs.loggly.com/inputs/';

exports.defaults = {
  enabled: false,
  inputToken: null,
  maxSockets: 10,
  log: true,
  err: true
};
_.defaults(config, exports.defaults);

exports.status = {
  enabled: false,
  log: false,
  err: false,
  sent: 0,
  confirmed: 0
};

exports.configure = function(c) {
  _.extend(config, c);

  if(!config.enabled)
    return;
  if(!config.inputToken)
    return printer.fatal("Loggly 'inputToken' not set");

  config.url = baseUrl + config.inputToken;

  printer.info('loggly enabled (input: ' + config.inputToken + ')');

  _.extend(exports.status, _.pick(config, 'enabled', 'log', 'err'));
};

exports.send = function(type, buffer) {
  var msg = {
    date: Date.now(),
    type: type,
    msg: printer.stripColors(buffer)
  };

  exports.status.sent++;
  // var id = exports.status.sent;

  request.post({
    pool: { maxSockets: config.maxSockets },
    url: config.url,
    // url: 'http://localhost:3000',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  }, function (err, res, body) {
    if(err) {
      printer.err('loggly http error: ' + err + "\n");
      return;
    } else if (res.statusCode !== 200) {
      printer.err('loggly error: ' + res.statusCode + ': ' + body + "\n");
      // printer.log(util.inspect(res, {colors:true, depth:0})+"\n");
      return;
    }
    exports.status.confirmed++;
    // printer.log('confirmed:'+exports.status.confirmed+"("+id+")\n");
  });

};





