
var printer = require("../printer");
var _ = require("lodash");
var request = require('request');
var queue = [];
var config = {};
var baseUrl = 'https://logs.loggly.com/inputs/';

exports.defaults = {
  enabled: false,
  inputToken: null,
  subdomain: null,
  delay: 5,
  maxSockets: 5,
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

  if(!config.inputToken)
    return printer.fatal("Loggly 'inputToken' not set");

  config.url = baseUrl + config.inputToken;

  printer.info('loggly enabled (input: ' + config.inputToken + ')');

  _.extend(exports.status, _.pick(config, 'enabled', 'log', 'err'));
};

var pop = function() {

  var msg = queue.pop();
  //"content-type:application/json"

  //config.url

  exports.status.sent++;

  request.post({
    url: 'http://localhost:3000',
    body: JSON.stringify(msg)

  }, function (e, r, body) {

    exports.status.confirmed++;

    printer.log(exports.status.confirmed);
  });

  if(queue.length === 0)
    clearInterval(pop.t);
};

exports.send = function(type, buffer) {
  // var msg = ;
  // printer.debug(msg);

  queue.push({
    date: Date.now(),
    type: type,
    msg: printer.stripColors(buffer)
  });

  if(queue.length === 1)
    pop.t = setInterval(pop, config.delay);
};

