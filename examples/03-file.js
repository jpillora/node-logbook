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

var i = 0;
var t = setInterval(function () {
  i++;
  console.log("hello log file", i);
  console.error("hello err file", i);
}, 5);

setTimeout(function() {
  clearInterval(t);
}, 1000);


