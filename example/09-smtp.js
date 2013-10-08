//log to smtp
require('../').configure({
  smtp: {
    enabled: true,
    username: '...@gmail.com',
    password: '...',
    to: ["...@gmail.com"],
    subject: "logbook test subject"
  }
});

console.log("hello log 1");
console.error("hello err 1");

setTimeout(function() {
  console.log("hello log 2");
  console.error("hello err 2");
}, 4300);

setTimeout(function() {
  console.log("hello log 3");
  console.error("hello err 3");
}, 7500);