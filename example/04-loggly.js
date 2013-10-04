//loggly example !
require('../').configure({
  loggly: {
    enabled: true,
    customerToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    tags: ["my-app"]
  }
});

console.log("hello loggly");
console.error("hello loggly :O !!");