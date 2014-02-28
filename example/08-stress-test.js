//log to file
require('../').configure({
  console: {
    timestamps: true,
    typestamps: true
  },
  file: {
    // Note, defaults are
    // log: "./log.txt",
    err: "./log.txt"
    // timestamps: true
  }
});

var i = 0;
// var t = setInterval(function ()
for(;i< 1000; ++i){
  i++;
  console.log("hello log file", i);
  console.error("hello err file", i);
}
// , 5);

// setTimeout(function() {
//   clearInterval(t);
// }, 1000);


