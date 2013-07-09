//loggly performance test
require('../').configure({
  loggly: {
    enabled: true,
    inputToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    subdomain: "my-subdomain"
  }
});

for(var i = 1; i <= 1000; ++i)
  console.log("hello loggly, this is message #"+i+"!");