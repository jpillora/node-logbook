//loggly example !
require('../').configure({
  loggly: {
    enabled: true,
    inputToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    subdomain: "my-subdomain"
  }
});

console.log("hello loggly");