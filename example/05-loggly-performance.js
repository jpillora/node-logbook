//loggly performance test
require('../').configure({
  loggly: {
    enabled: true,
    inputToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda"
  }
});

//this will take time to send !
//increase 'maxSockets' to make it faster, though risk being 403'd by loggly
for(var i = 1; i <= 100; ++i)
  console.error("hello loggly, this is message #"+i+"!");
