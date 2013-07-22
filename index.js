
require('colors');
var fs = require('fs');
var util = require('util');
var stream = require('stream');
var path = require('path');
var https = require('https');
https.globalAgent.maxSockets = 2000;
var loggly = null;
var logglyClient = null;

var xmpp = require('./xmpp');

var $out = process.stdout.write,
    $err = process.stderr.write;

//default config
var config = {
  console: {
    enabled: true,
    timestamps: false,
    typestamps: false
  },
  loggly: {
    enabled: false,
    inputToken: null,
    subdomain: null
  },
  file: {
    enabled: false,
    timestamps: true,
    typestamps: false,
    log: "./log.txt",
    err: "./err.txt"
  },
  xmpp: {
    enabled: false,
    jid: null,
    password: null,
    host: 'talk.google.com',
    port: 5222,
    to: "*",
    prefix: null,
    delay: 100,
    log: false,
    err: true
  }
};

// intercept console logs and errors and call all handlers
var makeWriteFn = function(type) {
  return function(buffer) {
    //check for active core handler
    for(var handler in coreHandlers)
      if(config[handler].enabled)
        coreHandlers[handler](type, buffer);
    //check for user handlers
    handlers.forEach(function(fn) {
      fn(type, buffer);
    });
  };
};
// monkey patch std[out|err]
process.stdout.write = makeWriteFn('log');
process.stderr.write = makeWriteFn('err');

//public methods
exports.configure = function(object) {

  //config each handler
  for(var name in coreHandlers) {
    //skip
    if(!object[name])
      continue;

    for(var prop in object[name])
      config[name][prop] = object[name][prop];

    if(object[name].enabled === true && coreInit[name])
      coreInit[name]();
  }

  return exports;
};

//user handlers
var handlers = [];
exports.add = function(fn) {
  handlers.push(fn);
  return exports;
};

exports.remove = function(fn) {
  var i = handlers.indexOf(fn);
  if(i === -1) return exports;
  handlers.splice(i,1);
  return exports;
};

var coreHandlers = {
  console: function(type, buffer) {
    var strs = [];
    if(config.console.typestamps)
      strs.push(type === 'err' ? type.red : type.cyan);
    if(config.console.timestamps)
      strs.push(time().grey);
    strs.push(buffer.toString());
    buffer = new Buffer(strs.join(' '));
    if(type === 'log')
      $out.call(process.stdout, buffer);
    else
      $err.call(process.stderr, buffer);
  },
  loggly: function(type, buffer) {

    if(!logglyClient)
      return error("Loggly not setup");
    if(!config.loggly.inputToken)
      return error("Loggly 'inputToken' not set");

    logglyClient.log(config.loggly.inputToken, {
      type: type,
      msg: stripColors(buffer.toString())
    }, function(err) {
      if(err) return error(err);
    });
  },
  file: function(type, buffer) {
    var strs = [];
    if(config.file.typestamps)
      strs.push(type);
    if(config.file.timestamps)
      strs.push(time());
    strs.push(stripColors(buffer.toString()));
    buffer = new Buffer(strs.join(' '));
    fs.appendFile(config.file[type], buffer);
  },
  xmpp: function(type, buffer) {
    if(!xmpp.connected)
      return error("XMPP not setup");
    xmpp.send(type, buffer.toString());
  }
};

var coreInit = {
  console: function() {
    info('console enabled');
  },
  file: function() {
    info('file enabled (log: '+config.file.log+', err: '+config.file.err + ')');
  },
  loggly: function() {
    if(!config.loggly.subdomain)
      return error('loggly missing subdomain');
    info('loggly enabled (subdomain: ' + config.loggly.subdomain + ')');
    if(!loggly)
      loggly = require('loggly');
    logglyClient = loggly.createClient({
      subdomain: config.loggly.subdomain,
      json: true
    });
  },
  xmpp: function() {
    if(!config.xmpp.jid || !config.xmpp.password)
      return error('xmpp missing jid or password');
    info('xmpp enabled (jid: ' + config.xmpp.jid + ')');
    xmpp.connect(
      config.xmpp
    );
  }
};

//helpers
var pad = function(n){
  return n<10 ? '0'+n : n;
};

var stripColors = function(str) {
  return str.replace(/\x1B\[\d+m/g, '');
};

var time = function() {
  var d = new Date();
  return util.format("[%s-%s-%s %s:%s:%s]",
                     d.getFullYear(),      pad(d.getMonth()+1), pad(d.getDate()),
                     pad(d.getHours()),    pad(d.getMinutes()), pad(d.getSeconds()));
};

var toArr = function(argsObj) {
  return Array.prototype.slice.call(argsObj);
};

//cant use console.log - write directly to stderr
var debug = function(obj) {
  $err.call(process.stderr, new Buffer("logbook DEBUG >> " + JSON.stringify(obj, null, 2) + "\n"));
};
//cant use console.log - write directly to stderr
var error = function(str) {
  $err.call(process.stderr, new Buffer(("logbook ERROR >> "+str+"\n").red));
};

var info = function(str) {
  $out.call(process.stdout, new Buffer(("logbook >> "+str+"\n").grey));
};

xmpp.on('debug', function() {
  debug(util.inspect([].slice.call(arguments)));
});

xmpp.on('error', function(err) {
  error('XMPP Error: ' + err);
});
