//loggly performance test
require('../').configure({
  loggly: {
    enabled: true,
    customerToken: "abcdefgh-85fe-41f7-9f09-5b018f68d691",
    tags: ["loggly-perf"],
    meta: {
      foo: 42,
      bar: function() { return Math.random() > 0.5 ? "heads" : "tails"; }
    }
  }
});

//this will take time to send !
//increase 'maxSockets' to make it faster, though risk being 403'd by loggly
for(var i = 1; i <= 100; ++i)
  console.error("hello loggly, this is message #"+i+"!");
