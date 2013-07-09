//show timestamps and 'log' or 'err' labels 
require('../').configure({
  console: {
    timestamps: true,
    typestamps: true
  }
});

//prettyyyyy
console.log('foo!');