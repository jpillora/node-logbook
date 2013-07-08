// runs as a forked process - require('child_process').fork
var loggly = require('loggly');
var https = require('https');
https.globalAgent.maxSockets = 9999;
var client = null;

process.on('message', function(message) {
  if(message.subdomain) {
    client = loggly.createClient({
      subdomain: message.subdomain,
      json: true
    });
    return;
  }
  if(!client)
    throw "loggly-client: No client configuration";
  client.log(message.token, message.obj);
});

process.send('ready');