
var helper = require("../helper");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");

var nodemailer = require('nodemailer');
var transport = null;
var config = null;
var queue = [];
var queuing = false;
var stats = { flushes: 0, last: null };

var config = exports.config = {
  username: null,
  password: null,
  from: "node-logbook",
  to: [],
  subject: "node-logbook",
  machineName: true,
  delay: 10*1000,
  log: false,
  err: false
};

exports.configure = function(c) {

  if(!config.enabled)
    return;

  if(typeof config.from !== 'string')
    return helper.fatal('smtp: from must be a string');
  if(typeof config.subject !== 'string')
    return helper.fatal('smtp: subject must be a string');
  if(typeof config.to === 'string')
    config.to = [config.to];
  if(!config.to || !config.to.length)
    return helper.fatal('smtp: define at least 1 recipient ("to")');

  var smtpOpts = {};

  //copy config NOT in 
  for(var key in config)
    if(!exports.defaults.hasOwnProperty(key))
      smtpOpts[key] = config[key];

  if(config.username && config.password)
    smtpOpts.auth = { user: config.username, pass: config.password };

  // smtpOpts.debug = true;
  if(config.machineName)
    config.subject += " (" + helper.hostname + ")";

  transport = nodemailer.createTransport("SMTP", smtpOpts);
};

var flush = function() {

  stats.flushes++;
  stats.last = new Date().toString();

  var msgs = queue.length;
  var msg = 'node-logbook has #'+msgs+' messages' + (config.machineName?' from ' + helper.hostname: '') + ':' +
  '\n=======\n'+
  queue.map(function(msg, i) {
    return ["#"+(i+1), msg.time, msg.type, msg.text].join(': ');
  }).join('\n\n')+
  '\n=======\n'+
  'hostinfo:\n'+ helper.hostinfo();

  queue = [];

  var email = {
    from: config.from,
    to: config.to.join(', '),
    subject: config.subject,
    text: msg
  };

  // helper.debug(email);

  // send mail with defined transport object
  transport.sendMail(email, function(error, response) {
    if(error)
      helper.fatal('smtp: send error: ' + error);
    else
      helper.info('smtp: sent #' + msgs + ' messages');
    // helper.debug(error);
    // helper.debug(response);
  });

  queuing = false;
};

exports.send = function(type, buffer) {

  if(!queuing) {
    setTimeout(flush, config.delay);
    queuing = true;
  }

  queue.push({type:type.toUpperCase(), text:helper.stripColors(buffer), time:helper.time()});
};
