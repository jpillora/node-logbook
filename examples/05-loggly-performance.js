//loggly performance test
require('../').configure({
  console: {
    enabled: false
  },
  loggly: {
    enabled: true,
    inputToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    subdomain: "my-subdomain"
  }
});

for(var i = 1; i <= 1000; ++i)
  console.error("hello loggly, this is message #"+i+"!");

//recieved 997/1000