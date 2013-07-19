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

console.log("hello log file");
console.error("hello err file");