//loggly example !
require('../').configure({
  loggly: {
    enabled: true,
    inputToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda"
  }
});

console.log("hello loggly");
console.error("hello loggly :O !!");