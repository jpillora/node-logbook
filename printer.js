

var util = require('util');

//original functions
var $out = process.stdout.write,
    $err = process.stderr.write;

exports.log = function(str) {
  $out.call(process.stdout, new Buffer(str));
};

exports.err = function(str) {
  $err.call(process.stderr, new Buffer(str));
};

exports.info = function(str) {
  exports.log(("logbook >> "+str+"\n").grey);
};

exports.debug = function(obj) {
  exports.err(("logbook DEBUG >> "+JSON.stringify(obj, null, 2)+"\n").red);
};

exports.fatal = function(str) {
  exports.err(("logbook ERROR >> "+str+"\n").red);
};

exports.stripColors = function(buffer) {
  return buffer.toString().replace(/\x1B\[\d+m/g, '');
};


var pad = function(n){
  return n<10 ? '0'+n : n;
};

var xpad = function(n){
  return n<100 ? '0'+pad(n) : n;
};

exports.time = function() {
  var d = new Date();
  return util.format("[%s-%s-%s %s:%s:%s:%s]",
                     d.getFullYear(),      pad(d.getMonth()+1), pad(d.getDate()),
                     pad(d.getHours()),    pad(d.getMinutes()), pad(d.getSeconds()),
                                                           xpad(d.getMilliseconds()));
};