
var util = require('util');
exports._ = require('lodash');

//original functions
var $out = process.stdout.write,
    $err = process.stderr.write;

exports.log = function(str) {
  $out.call(process.stdout, new Buffer(str));
};

exports.err = function(str) {
  $err.call(process.stderr, new Buffer(str));
};

exports.info = function() {
  exports.log(("logbook >> "+util.format.apply(util, arguments)+"\n").grey);
};

exports.debug = function(obj) {
  exports.err(("logbook DEBUG >> "+util.inspect(obj)+"\n").blue);
};

exports.fatal = function() {
  exports.err(("logbook ERROR >> "+util.format.apply(util, arguments)+"\n").red);
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

var os = require("os");
exports.hostname = os.hostname();

exports.hostinfo = function() {
  var osdata = {time: exports.time()};
  for(var fnName in os)
    if(fnName !== 'getNetworkInterfaces' &&
       typeof os[fnName] === 'function')
      osdata[fnName] = os[fnName]();

  var str = JSON.stringify(osdata, null, '- ');
  str = str.replace(/[\{\}",]/g,'');
  str = str.split('\n').filter(function(line) {return !/^[\s\-]*$/.test(line); }).join('\n');
  return str;
};


