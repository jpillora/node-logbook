
var printer = require("../printer");
var _ = require("lodash");
var fs = require("fs");
var path = require("path");

//hack to suppress warning message
//create a dummy module if its missing
if(!fs.existsSync(path.join(__dirname,'..','node_modules','simple-xmpp',
                                          'node_modules','node-xmpp',
                                          'node_modules','node-stringprep'))) {
  fs.writeFileSync(path.join(__dirname,'..','node_modules','node-stringprep.js'),
   'var I = function(a) { return a; };'+
   'exports.StringPrep = function(){ this.prepare = I; };'+
   'exports.toUnicode = I;');
}

var SimpleXMPP = require('simple-xmpp').SimpleXMPP;
var buddies = null;
var client = null;
var config = null;
var queue = null;
var queuing = false;
var ready = false;
var os = require("os");
var hostname = os.hostname();
var stats = { flushes: 0, last: null };
var config = {};

exports.defaults = {
  enabled: false,
  jid: null,
  password: null,
  host: 'talk.google.com',
  port: 5222,
  to: "*",
  prefix: null,
  machineName: false,
  delay: 100,
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
  if(!config.jid || !config.password)
    return printer.fatal('XMPP missing jid or password');

  printer.info('xmpp enabled (jid: ' + config.jid + ')');

  buddies = {};
  queue = [];
  client = new SimpleXMPP();

  // client.on('online', function() {
  //   emit('debug', 'online');
  // });
  // client.on('stanza', function(s) {
  //   emit('debug', s);
  // });
  // client.on('buddyCapabilities', function(jid, data) {
  //   client.send(jid, data.clientName + ": " + data.features);
  // });

  client.on('chat', function(from, message) {
    if(/report/.test(message))
      report(from);
    else
      client.send(from, message+'?');
  });

  client.on('error', function(err) {
    printer.fatal('XMPP Error: ' + err.toString());
  });

  client.on('buddy', function(jid, state, statusText) {

    if(ready === false) readyNow();

    if(config.to instanceof Array)
      if(config.to.indexOf(jid) === -1)
        return;

    if(state === 'offline')
      delete buddies[jid];
    else
      buddies[jid] = true;

  });

  if(config.autoAccept === true)
    client.on('subscribe', function(from) {
      client.acceptSubscription(from);
    });

  client.connect({
    jid:      config.jid,
    password: config.password,
    host:     config.host || 'talk.google.com',
    port:     config.port || 5222
  });

  _.extend(exports.status, _.pick(config, 'enabled', 'log', 'err'));
};

var readyNow = function() {
  ready = true;
  printer.info('xmpp online');
  client.setPresence('online', 'Online: '+new Date());
  setTimeout(function() {
    if(queue.length) flush();
  }, 2000);
};

var report = function(sender) {
  var osdata = {};
  for(var fnName in os)
    if(fnName !== 'getNetworkInterfaces' &&
       typeof os[fnName] === 'function')
      osdata[fnName] = os[fnName]();

  client.send(sender, JSON.stringify({
    time: new Date().toString(),
    stats: stats,
    os: osdata
  },null, 2));
};

var flush = function() {

  stats.flushes++;
  stats.last = new Date().toString();

  var msg = (config.machineName ? hostname+': ' : '') +
            (config.prefix ? config.prefix+': ' : '') +
            (queue.length >1 ? '#'+queue.length+' messages: ':'');

  msg += '\n'+queue.map(function(arr) {
    return arr[0].toUpperCase() + ": " + arr[1];
  }).join('\n');

  queue = [];

  for(var buddy in buddies)
    client.send(buddy, msg);

  queuing = false;
};

exports.send = function(type, buffer) {

  if(!queuing && ready) {
    setTimeout(flush, config.delay);
    queuing = true;
  }

  queue.push([type, printer.stripColors(buffer)]);
};







