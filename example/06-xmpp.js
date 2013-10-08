//log to xmpp (Google Talk)
require('../').configure({
  xmpp: {
    enabled: true,
    jid: '...@gmail.com',
    password: '...',

    // default is gtalk
    // host: 'talk.google.com',
    // port: 5222,

    // default is "*" (whitelist of 'jid's)
    // to: "*",

    // default is
    // err: true,
    // log: false 
    log: true
  }
});

console.log("hello log");
console.error("hello err");