//loggly example !
require('../').configure({
  loggly: {
    enabled: true,
    customerToken: "abcdefgh-85fe-41f7-9f09-5b018f68d691",
    tags: ["my-app"],
    meta: {
      foo: 42,
      bar: function() { return Math.random() > 0.5 ? "heads" : "tails"; }
    }
  }
});

console.log("hello loggly");
console.error("hello loggly :O !!");