var loggers = require('./').loggers;
var defaults = {};

for(var n in loggers) {
  defaults[n] = loggers[n].defaults;
}

console.log(JSON.stringify(defaults, null, 2));