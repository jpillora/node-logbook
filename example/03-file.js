//log to file
require('../').configure({
  console: {
    log: false,
    err: false
  },
  file: {
    log: true,
    err: true
  }
});

for(var i = 0; i< 10; ++i) {
  console.log("hello log file", i);
  console.error("hello err file", i);
}
