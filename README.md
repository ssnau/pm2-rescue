pm2-rescue
-------


For some reason, async javascript code would lost in limbo. Fortunately, a lot javascript programmer use `PM2` to manage their app and start multi instances.
However, it does not solve the problem. A app run into limbo does not means it is died while PM2 cannot restart it automatically. 
That's why I create pm2-rescue.

Install
----

```
npm install pm2-rescue
```


Usage
-----

```javascript
var PMC = require('pm2-rescue');

var pmc = new PMC({
  // Required. The absolute filepath you want to store you pid info
  filename: String,
  // Optinal. The pm_id of current process, default to be process.env.pm_id
  pm_id: String, 
  // Optinal. The number of millionseconds you think we should run rescue. 
  // default to be 2000ms
  timeout: Number, 
  // Required. The absolute path to pm2 binary file.
  pm2bin: String, 
  // Optional. The function we need to call when we run rescue, 
  // this function should return a promise with {code: Number, out: String}.
  // default to be `pm2 restart ${pm_id}`
  restart: AsyncFunction
});
```

Method
--------

You should call the following two method periodically to make `pm2-rescue` works.

### update()

write current instance status into file status file.

### rescue

check the status file to see if there were any process in time-out-mode, and restart them.

License
---
MIT
