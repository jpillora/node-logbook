
var printer = require("../printer");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");

var nodemailer = require('nodemailer');
var transport = null;
var config = null;
var queue = [];
var queuing = false;
var os = require("os");
var hostname = os.hostname();
var stats = { flushes: 0, last: null };
var config = {};

exports.defaults = {
  enabled: false,
  username: null,
  password: null,
  from: "node-logbook",
  to: [],
  subject: "node-logbook",
  machineName: true,
  delay: 1000,
  log: false,
  err: true
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

  if(typeof config.from !== 'string')
    return printer.fatal('SMTP: from must be a string');
  if(typeof config.subject !== 'string')
    return printer.fatal('SMTP: subject must be a string');
  if(typeof config.to === 'string')
    config.to = [config.to];
  if(!config.to || !config.to.length)
    return printer.fatal('SMTP: define at least 1 recipient ("to")');

  var smtpOpts = {};

  //copy config NOT in 
  for(var key in config)
    if(!exports.defaults.hasOwnProperty(key))
      smtpOpts[key] = config[key];

  if(config.username && config.password)
    smtpOpts.auth = { user: config.username, pass: config.password };

  // smtpOpts.debug = true;
  if(config.machineName)
    config.subject += ": " + hostname;

  transport = nodemailer.createTransport("SMTP", smtpOpts);

  printer.info('smtp enabled (' + config.username + ')');

  _.extend(exports.status, _.pick(config, 'enabled', 'log', 'err'));
};

var flush = function() {

  stats.flushes++;
  stats.last = new Date().toString();

  var msg = (config.machineName ? hostname+': ' : '') + '#'+queue.length+' messages: ';
  msg += '\n=======';
  msg += '\n'+queue.map(function(arr) {
    return arr[0].toUpperCase() + ": " + arr[1];
  }).join('\n');

  queue = [];

  var email = {
    from: config.from,
    to: config.to.join(', '),
    subject: config.subject,
    text: msg
  };

  // printer.debug(email);

  // send mail with defined transport object
  transport.sendMail(email, function(error, response){
    if(error) printer.fatal('SMTP: send error: ' + error);
    // printer.debug(error);
    // printer.debug(response);
  });

  queuing = false;
};

exports.send = function(type, buffer) {

  if(!queuing) {
    setTimeout(flush, config.delay);
    queuing = true;
  }

  queue.push([type, printer.stripColors(buffer)]);
};
