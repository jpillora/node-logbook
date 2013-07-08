
var fs = require('fs');
var util = require('util');
var stream = require('stream');
var path = require('path');
var fork = require('child_process').fork;

require('colors');

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
    output: './logbook.txt',
    timestamps: false,
    typestamps: false
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

  //store old client  
  var old = config.loggly.subdomain;

  //config each handler
  for(var handlerName in coreHandlers)
    for(var key in object[handlerName])
      config[handlerName][key] = object[handlerName][key];

  //new client
  if(config.loggly.subdomain !== old)
    sendToLoggly({ subdomain: config.loggly.subdomain });

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
      strs.push(type === 'error' ? type.red : type.cyan);
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
    sendToLoggly({
      token: config.loggly.inputToken,
      obj: {
        type: type,
        msg: buffer.toString()
      }
    });
  },
  file: function(type, buffer) {
    fs.appendFile(config.file.output, buffer);
  }
};

//send to loggly process - with message queuing
var loggly = fork(path.join(__dirname,'loggly-client.js'));
loggly.ready = false;
loggly.queue = [];
loggly.on('message', function() {
  loggly.ready = true;
  loggly.queue.forEach(sendToLoggly);
  loggly.queue = [];
});

var sendToLoggly = function(obj) {
  if(!loggly.ready) {
    loggly.queue.push(obj);
    loggly.ready = true;
    return;
  }
  loggly.send(obj);
};

// setTimeout(loggly.kill.bind(loggly,'SIGHUP'), 2000);

//helpers
var pad = function(n){
  return n<10 ? '0'+n : n;
};

var time = function() {
  var d = new Date();
  return util.format("[%s-%s-%s.%s:%s:%s]",
                     d.getFullYear(),      pad(d.getMonth()+1), pad(d.getDate()),
                     pad(d.getHours()),    pad(d.getMinutes()), pad(d.getSeconds()));
};

var toArr = function(argsObj) {
  return Array.prototype.slice.call(argsObj);
};


