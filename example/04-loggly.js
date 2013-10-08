//loggly example !
require('../').configure({
  loggly: {
    enabled: true,
    customerToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    tags: ["loggly"]
  }
});

console.log("hello loggly");
console.error("hello loggly :O !!");