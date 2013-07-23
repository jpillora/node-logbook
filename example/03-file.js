//log to file
require('../').configure({
  file: {
    enabled: true
    // Note, defaults are
    // log: "./log.txt",
    // err: "./err.txt",
    // timestamps: true
  }
});

for(var i = 0; i< 10; ++i) {
  console.log("hello log file", i);
  console.error("hello err file", i);
}
