Logbook
============

A simple, unobtrusive logger for Node.

Nothing fancy - logs all data that passes through `process.stdout` (`console.log`) and `process.stderr` (`console.error`).

### Features

* **Simple**
  * Keep using `console`
* Intercepts `process.stdout` and `process.stderr` producing two log levels:
  * `LOG`
  * `ERR`
* Log to:
  * Console
  * File
  * Loggly
  * SMTP (Email)
  * [Make your own](https://github.com/jpillora/node-logbook#custom-log-handlers)
* Use [Logbook Plugins](https://github.com/jpillora/node-logbook#plugins) and log to:
  * [XMPP](https://github.com/jpillora/node-logbook-xmpp) (Google Talk)


### Quick Usage

Install:
```
npm install --save logbook
```

Then include in your entry file:
``` js
require('logbook').configure({
  console: {
    enabled: false
  },
  smtp: {
    enabled: true,
    username: '...@gmail.com',
    password: '...',
    to: ["john@smith.com", "jane@doe.com"]
  }
});
```

Send an email on crash:
``` js
process.on('uncaughtException', function(err) {
  console.error('Oh noez, I\'ve crashed!!!!\n' + (err.stack || err));
});
```

### Log to File

Disable console and log `stdout` `stderr` to `log.txt` and `err.txt` with timestamps:

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

### Log to Loggly (Gen2)

Disable console and send `stdout` and `stderr` to [Loggly](http://www.loggly.com/plans-and-pricing/) (200MB/day free):

``` javascript
require('logbook').configure({
  console: {
    log: false,
    err: false
  },
  loggly: {
    log: true,
    err: true,
    customerToken: "abcd1234-1234-40bd-bddf-5ff562eb1cda",
    tags: ["my-app"]
  }
});
```

### Log to SMTP (Email)

``` javascript
require('logbook').configure({
  smtp: {
    log: true,
    err: true,
    username: '...@gmail.com',
    password: '...',
    to: ["john@smith.com", "jane@doe.com"]
  }
});
```

Again, only `stderr` is logged by default.

### Log to all the thingsss

``` javascript
require('logbook').configure({
  console: {
    log: true,
    err: true,
  },
  file: {
    log: true,
    err: true,
    ...
  },
  loggly: {
    log: true,
    err: true,
    ...
  },
  smtp: {
    log: true,
    err: true,
    ...
  }
});
```

### More Examples

*See the [examples](https://github.com/jpillora/node-logbook/tree/master/examples) directory for more*

### Default Configuration

With this default configuration, `logbook` will have no effect, console will function as expected.

<runFile('./show-defaults')>
```
{
  "console": {
    "timestamps": false,
    "typestamps": false,
    "log": true,
    "err": true
  },
  "file": {
    "timestamps": true,
    "typestamps": false,
    "log": false,
    "err": false,
    "logPath": "./log.txt",
    "errPath": "./err.txt"
  },
  "loggly": {
    "customerToken": null,
    "maxSockets": 10,
    "machineName": false,
    "tags": null,
    "meta": null,
    "log": false,
    "err": false
  },
  "smtp": {
    "username": null,
    "password": null,
    "from": "node-logbook",
    "to": [],
    "subject": "node-logbook",
    "machineName": true,
    "delay": 10000,
    "log": false,
    "err": false
  },
  "xmpp": {
    "jid": null,
    "password": null,
    "host": "talk.google.com",
    "port": 5222,
    "to": "*",
    "prefix": null,
    "machineName": false,
    "delay": 100,
    "log": false,
    "err": false
  }
}

```
</end>

### Plugins

Logbook plugins are just node modules that `export` a `send` method:

``` js
exports.send = function(type, buffer) {
  type === 'log' || type === 'err';   //true
  buffer instanceof Buffer;           //true
};
```

`logbook`'s parent folder (usually `node_modules`), is searched for plugins (other folders) with
the name `logbook-`*`my-plugin-name`*. For example, to install both `logbook` and `logbook-my-plugin-name`,
we can do `npm install --save logbook-my-plugin-name`, which will now allow `logbook` to see `logbook-my-plugin-name`
as it will reside along side it in `node_modules`.

**Warning** Using `console.``log`/`error` in your plugin will cause an infinite loop. Instead use:
``` js
var helper = require("../logbook").helper;
helper.info("my logbook console message");
```

You can define a default configuration with
``` js
exports.config = {
  my: "defaults"
};
```

You can also create a `configure` function (to verify configuration or init modules):
``` js
exports.configure = function() {
  // check exports.config
};
```
This function is called when the user calls `require("logbook").configure({  })`.

See the [XMPP](https://github.com/jpillora/node-logbook-xmpp) plugin for reference.

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

All loggers have two options:

##### `log` (Boolean)

Enable or disable log events

##### `err` (Boolean)

Enable or disable error events

------

#### File

See [defaults](#default-configuration)

------

#### Loggly

See [defaults](#default-configuration)

**Important: Uses Loggly Gen2**

Each log will be in the form

``` javascript
{
  type: "log|err",
  msg: "...",
  date: unix-epoch,
  tags: ["...", "...", "log|err"]
}
```

*Note: `tags` and `meta` may contain functions. These functions will be evalutated once for each
log event. The result value must be stringifiable otherwise it will be discarded.*

##### `customerToken` (String)

The token provided by loggly which identifies your account.

##### `tags` (Array)

The tags applied each log event. See [Tags](http://www.loggly.com/docs/tags/).

The log type (`logbook-log`|`logbook-err`) will always be appended to the tags array. *Tip: Since there are no longer input tokens, differentiate application logs with tags. Add a 'my-app' tag and you can search for all of it's errors with `tag:logbook-err AND tag:my-app`.*

##### `meta` (Object)

An object that will be merged into the object above. Will not override existing values.

##### `maxSockets` (Number)

The number of http agents to use when connecting to Loggly. Can be thought of as amount of 
concurrency, so beware of hitting Loggly too much as you may be seen as DOS attack. Hence,
default is only 10.


------

#### SMTP

See [defaults](#default-configuration)

Uses [Nodemailer](https://github.com/andris9/Nodemailer)

*Important:* All properties **not** in the defaults will be used to create the [SMTP options object](https://github.com/andris9/Nodemailer#setting-up-smtp) which will be passed into  `createTransport("SMTP", options)`.

##### `username` `password`

Shorthand for `auth: { user: username, pass: password }`. See [SMTP options object](https://github.com/andris9/Nodemailer#setting-up-smtp).

##### `to` **required**

An array of email addresses

##### `delay`

This is the delay (in milliseconds) before all acculated messages are concatenated and sent.
This helps to prevent performance loss by batching messages.

------

### Conceptual Overview

This module simply assigns a new functions to `process.stdout|err.write` to
intercept all `console.log()`s and `console.error()`s.

### Todo

* Make a CLI looking for a `logbook.json` file used as config
  * Runs in place of `node`, though `logbook script.js` logs all `stdout` `stderr`
  * Auto restarts, logging restart events
* Add tests

<license()>
#### MIT License

Copyright &copy; 2014 Jaime Pillora &lt;dev@jpillora.com&gt;

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
</end>

