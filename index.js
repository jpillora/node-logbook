
var logbook = module.exports = {};

require('colors');
//helper grabs original process.std[out|err] functions before patching
var helper = logbook.helper = require('./helper');
var fs = require('fs');
var path = require('path');

var loggers = logbook.loggers = {};
var addLogger = function(name, path) {
  if(loggers[name])
    return helper.fatal("Logger already exists '%s'", name);
  var logger;
  try {
    logger = require(path);
  } catch(err) {
    return helper.fatal("Failed to require logger '%s'\n  %s", name, err.stack||err);
  }

  if(typeof logger.send !== "function")
    return helper.fatal("Logger '%s' is missing the 'send' function", name);

  logger.name = name;
  loggers[name] = logger;
};
// load all local plugins
var loggersDir = path.join(__dirname, 'loggers');
fs.readdirSync(loggersDir).forEach(function(file) {
  var name = file.replace(/\.js$/,'');
  addLogger(name, path.join(loggersDir, file));
});

// load all external plugins
var modulesDir = path.join(__dirname, '..');
fs.readdirSync(modulesDir).forEach(function(module) {
  if(/^logbook-([\w-]+)$/.test(module))
    addLogger(RegExp.$1, path.join(modulesDir, module));
});

// intercept console logs and errors and call all handlers
var makeWriteFn = function(type) {
  return function(buffer) {
    //check for active core handler
    for(var l in loggers) {
      var logger = loggers[l];
      if(logger.config[type])
        logger.send(type, buffer);
    }
    //check for user handlers
    handlers.forEach(function(fn) {
      fn(type, buffer);
    });
  };
};

var sharedDefaults = {
  log: false,
  err: false
};

var isConfigured = false;

function enabled() {
  return this.log || this.err;
}

//public methods
logbook.configure = function(object) {

  if(isConfigured) {
    helper.fatal("Logbook can not be configured more than once");
    return logbook;
  }

  // monkey patch std[out|err]
  process.stdout.write = makeWriteFn('log');
  process.stderr.write = makeWriteFn('err');

  //config each handler
  for(var name in loggers) {
    var logger = loggers[name];

    if(!logger.config)
      logger.config = {};
    //apply changes
    helper._.defaults(logger.config, sharedDefaults);
    helper._.extend(logger.config, object[name] || {});

    Object.defineProperty(logger.config, 'enabled', { get: enabled });

    //configure logger if able
    if(logger.configure) {
      logger.configure();
    }

    //display enabled loggers
    if(logger.config.enabled) {
      helper.info("'%s' enabled", logger.name);
    }
  }

  isConfigured = true;
  return logbook;
};

//user handlers
var handlers = [];
logbook.add = function(fn) {
  handlers.push(fn);
  return logbook;
};

logbook.remove = function(fn) {
  var i = handlers.indexOf(fn);
  if(i === -1) return logbook;
  handlers.splice(i,1);
  return logbook;
};
