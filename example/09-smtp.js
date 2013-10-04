//log to smtp
require('../').configure({
  smtp: {
    enabled: true,
    username: '...@gmail.com',
    password: '...',
    to: "...@gmail.com"
  }
});

console.log("hello log");
console.error("hello err");