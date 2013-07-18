//log to xmpp (Google Talk)
require('../').configure({
  xmpp: {
    enabled: true,
    // jid: '...',
    // password: '...',
    jid: 'jpillora@think.edu.au',
    password: 'St65gtGJUiN07Omx',
    // default is gtalk
    // host: 'talk.google.com',
    // port: 5222,

    // default is "*" (whitelist of 'jid's)
    // to: "*",
    to: ["19lm5trlns4t12idtnu22nzns0@public.talk.google.com"],

    log: false,
    err: true
  }
});

console.log("hello log");
console.error("hello err");

var i = 0;

setInterval(function() {
  console.log("i",i++);
}, 1000);