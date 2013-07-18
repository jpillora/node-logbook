
var SimpleXMPP = require('simple-xmpp').SimpleXMPP;
var buddies = null;
var client = null;
var queue = null;
var ready = false;

var emitter = new (require('events').EventEmitter)();
exports.on = emitter.on.bind(emitter);

exports.connected = false;

exports.connect = function(settings) {

  settings = settings || {};
  buddies = {};
  queue = [];
  client = new SimpleXMPP();

  // client.on('online', function() {
  //   emitter.emit('online', queue.length);
  // });

  client.on('error', function(err) {
    emitter.emit('error', err.toString());
  });

  client.on('buddy', function(jid, state, statusText) {

    if(ready === false) {
      ready = true;
      setTimeout(function() {
        queue.forEach(exports.send);
      }, 2000);
    }

    if(settings.to instanceof Array)
      if(settings.to.indexOf(jid) === -1)
        return;

    emitter.emit('debug', jid, state, statusText);

    if(state === 'offline')
      delete buddies[jid];
    else
      buddies[jid] = true;
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

exports.send = function(msg) {
  if(!ready)
    return queue.push(msg);

  for(var buddy in buddies)
    client.send(buddy, msg);

};


