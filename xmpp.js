
//hack to suppress warning message
var fs = require("fs");
var path = require("path");
fs.writeFileSync(path.join(__dirname,'node_modules','node-stringprep.js'),
 'var I = function(a) { return a; };'+
 'exports.StringPrep = function(){ this.prepare = I; };'+
 'exports.toUnicode = I;');

var SimpleXMPP = require('simple-xmpp').SimpleXMPP;
var buddies = null;
var client = null;
var settings = null;
var queue = null;
var queuing = false;
var ready = false;
var os = require("os");

var emitter = new (require('events').EventEmitter)();
var emit = emitter.emit.bind(emitter);
exports.on = emitter.on.bind(emitter);

exports.connected = false;

var stats = { flushes: 0, last: null };

var readyNow = function() {
  ready = true;
  setTimeout(function() {
    client.setPresence('online', 'Reporting for Duty');
    exports.send('logbook','ONLINE! (delay: ' + settings.delay + 'ms)');
  }, 2000);
};

var report = function(sender) {

  var osdata = {};
  for(var fnName in os)
    if(fnName !== 'getNetworkInterfaces' && typeof os[fnName] === 'function')
      osdata[fnName] = os[fnName]();

  client.send(sender, JSON.stringify({
    time: new Date().toString(),
    stats: stats,
    os: osdata
  },null, 2));

};

exports.connect = function(s) {

  settings = s || {};
  settings.delay = settings.delay|| 10000;

  buddies = {};
  queue = [];
  client = new SimpleXMPP();

  // client.on('online', function() {
  //   emit('debug', 'online');
  // });
  // client.on('stanza', function(s) {
  //   emit('debug', s);
  // });

  client.on('chat', function(from, message) {
    if(/report/.test(message)) report(from);
  });

  client.on('error', function(err) {
    emit('error', err.toString());
  });

  client.on('buddy', function(jid, state, statusText) {

    if(ready === false) readyNow();

    if(settings.to instanceof Array)
      if(settings.to.indexOf(jid) === -1)
        return;

    if(state === 'offline')
      delete buddies[jid];
    else
      buddies[jid] = true;

  });

  client.on('buddyCapabilities', function(jid, data) {
    client.send(jid, data.clientName + ": " + data.features);
  });

  if(settings.autoAccept === true)
    client.on('subscribe', function(from) {
      client.acceptSubscription(from);
    });

  client.connect({
    jid:      settings.jid,
    password: settings.password,
    host:     settings.host || 'talk.google.com',
    port:     settings.port || 5222
  });

  exports.connected = true;
};

var flush = function() {

  stats.flushes++;
  stats.last = new Date().toString();

  var msg = (settings.prefix ? settings.prefix+': ' : '') +
            (queue.length >1 ? '#'+queue.length+' messages: ':'');
  msg += queue.map(function(arr) {
    return arr[0].toUpperCase() + ": " + arr[1];
  }).join('\n');
  queue = [];

  for(var buddy in buddies)
    client.send(buddy, msg);

  queuing = false;
};

exports.send = function(type, msg) {

  if(!settings)
    emit('error', 'settings missing');

  if((type === 'err' && !settings.err) ||
     (type === 'log' && !settings.log))
    return;

  if(!queuing && ready) {
    setTimeout(flush, settings.delay);
    queuing = true;
  }

  queue.push([type,msg]);
};







