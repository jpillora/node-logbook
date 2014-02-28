//logbook-xmpp plugin required
//log to xmpp (Google Talk)
require('../').configure({
  xmpp: {
    jid: '...@gmail.com',
    password: '...',

    // default is gtalk
    // host: 'talk.google.com',
    // port: 5222,

    // default is "*" (whitelist of 'jid's)
    // to: "*",
    log: true,
    err: true
  }
});

console.log("hello log");
console.error("hello err");