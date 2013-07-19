Logbook
============

Yet another logger for Node.

Nothing fancy - logs all data that passes through `process.stdout` and `process.stderr` (`console.log()` and `console.error()`).

### Features

* **Simple**
* Intercepts `process.stdout` and `process.stderr` producing two log levels:
  * `LOG`
  * `ERR`
* Optionally log to:
  * Console
  * File
  * Loggly
  * XMPP (Google Talk)
  * [Make your own](https://github.com/jpillora/node-logbook#custom-log-handlers)

### Usage

```
npm install logbook
```

### Log to File

Disable console and log `stdout` `stderr` to `log.txt` and `err.txt` with a time stamp:

``` javascript
require('logbook').configure({
  console: {
    enabled: false
  },
  file: {
    enabled: true
  }
});
```

### Log to Loggly

Disable console and send `stdout` `stderr` to [Loggly](https://app.loggly.com/pricing/) (200MB/day free):

``` javascript
require('logbook').configure({
  console: {
    enabled: false
  },
  loggly: {
    enabled: false,
    inputToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    subdomain: "my-subdomain"
  }
});
```

### Log to XMPP a.k.a "Jabber" (Google Talk)

Disable console and send `stdout` `stderr` to everyone in your contact list:

``` javascript
require('logbook').configure({
  console: {
    enabled: false
  },
  xmpp: {
    enabled: true,
    jid: '...@gmail.com',
    password: '...'
  }
});
```

### Log to all the thingsss

``` javascript
require('logbook').configure({
  console: {
    enabled: true
  },
  file: {
    enabled: true,
    ...
  },
  loggly: {
    enabled: true,
    ...
  },
  xmpp: {
    enabled: true,
    ...
  }
});
```

*See [examples](https://github.com/jpillora/node-logbook/tree/master/examples) directory for more*

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
    timestamps: true,
    typestamps: false,
    log: "./log.txt",
    err: "./err.txt"
  },
  xmpp: {
    enabled: false,
    jid: null,
    password: null,
    host: 'talk.google.com',
    port: 5222,
    to: "*",
    delay: 100,
    log: false,
    err: true
  }
}
```

### Custom Log Handlers

Add custom log handlers with `add()`

``` javascript
require('logbook').configure({
  ...
}).add(function(type, buffer) {
  type === 'log' || type === 'err';   //true
  buffer instanceof Buffer;           //true
});
```

### **API**

Configure loggers with `configure()`

#### File

* Writes will also append to each file

#### Loggly

Each log will be in the form

``` javascript
{
  type: "log|err"
  msg: "..."
}
```

This will be JSON encoded, so ***please only use HTTPS+JSON inputs!***

##### `inputToken`

The token provided by loggly which identifies the input (or data bucket)
that you're logging to.

##### `subdomain`

The loggly subdomain used to identify your account.

#### XMPP

##### `to`

An array of `jid` Jabber IDs (Google Accounts in the case of Google Talk).
By default it's the string "*", which means everyone in the given
accounts contact list. Useful if you create
a logbook Jabber account, then you can "subscribe" to it at will.

##### `delay`

This is the delay (in milliseconds) before all acculated messages are sent out.
This helps trying to send thousands of messages concurrently resulting from a
long synchronous loop.  

### Conceptual Overview

This module simply assigns a new functions to `process.stdout|err.write`. Captures
all calls to it, calls the original versions when `console.enabled true`.

### Todo

* Make a CLI looking for a `logbook.json` file
  * Wraps `logbook <script.js>` logs all `stdout` `stderr`
  * Auto restarts, logging restart events
* Add some tests

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

