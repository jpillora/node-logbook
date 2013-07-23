//loggly example !
require('../').configure({
  loggly: {
    enabled: true,
      "inputToken": "b4c2378d-9727-40bd-bddf-5ff562eb1cda",
      "subdomain": "think"
  }
});

console.log("hello loggly");
console.error("hello loggly :O !!");