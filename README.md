Logbook
============

Yet another logger for Node. Nothing fancy - logs all data that passes through `process.stdout` and `process.stderr` (includes `console.log` and `console.error`). If you don't wish to log something, delete the code. Your program should only be logging things you wish to see.

### Goals

* **Simple**
* Use process.stdout and process.stderr the two log channels
* Log to:
  * Console
  * File
  * Loggly
  * ???

### Usage

```
npm install logbook
```

``` javascript
require('logbook').configure({
  console: {
    enabled: false
  },
  loggly: {
    client: {
    }
  }
});
```

*See examples directory*

### Default Configuration

By default `logbook` has no effect, it will simply pass
all output back the associated pipe (stdout or stderr).

``` javascript
{
  console: {
    enabled: true,
    timestamps: false,
    typestamps: false
  },
  loggly: {
    enabled: false,
    inputToken: null,
    subdomain: null
  },
  file: {
    enabled: false,
    timestamps: false,
    typestamps: false,
    log: "./log.txt",
    err: "./err.txt"
  }
}
```

### Loggly

Each log will be in the form

``` javascript
{
  type: "log" OR "err"
  msg: LOGSTRING
}
```
This will be JSON encoded, so ***please only use HTTPS+JSON inputs!***

#### `inputToken`

The token provided by loggly which identifies the input (or data bucket)
that you're logging to.

#### `subdomain`

The loggly subdomain used to identify your account.

### Custom Log Handlers

``` javascript
require('logbook').configure({
  ...
}).add(function(type, buffer) {
  type === 'log' || type === 'err';   //true
  buffer instanceof Buffer;           //true
});
```

## MIT License

Copyright © 2013 Jaime Pillora &lt;dev@jpillora.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

