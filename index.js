"use strict";
var fs = require('fs');
var xspawn = require('xspawn');
var co = require('co');
var TIMEOUT =  1000 * 60 * 20; // default to be 20min inactive
var util = require('./util');

const instanceID = process.env.pm_id; // pm2 process id

class PM2Cooperation {
  constructor(cfg) {
    this.filename = cfg.filename;
    this.pm_id = cfg.pm_id || process.env.pm_id;
    this.timeout = cfg.timeout || TIMEOUT;
    this.pm2bin = cfg.pm2bin;
    this.restart = cfg.restart; // a custom restart function
    this.lock = false;
    this._lastCheckHandler = null;
  }
  update() {
    var obj = {};
    obj[this.pm_id] = {
      pm_id: this.pm_id,
      ts: Date.now(),
      time_str: util.formatTime(new Date()),
    };
    util.mergeJSON(this.filename, obj);
    if (this._lastCheckHandler) clearTimeout(this._lastCheckHandler);
    this._lastCheckHandler = setTimeout(() => this.rescue(), this.timeout);
  }
  rescue() {
    if (this.lock) return; // never ever run rescue simultaneously
    var json = util.readJSON(this.filename);
    var now = Date.now();
    var keys = Object.keys(json);
    var me = this;
    me.lock = true;
    return co(function*() {
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var info = json[key];  
        if (now - info.ts < me.timeout) continue;
        if (info.last_rescue && now - info.last_rescue < me.timeout) continue;
        var res = yield (me.restart ? me.restart(key, info) : xspawn(`${me.pm2bin} restart ${info.pm_id}`));
        if (String(res.code) !== '0') {
          util.deleteKey(me.filename, key);
          info.last_rescue = Date.now();
        }
        console.log(res.out);
      }
      me.lock = false;
    }).catch(e => {
      console.log(e.stack);
      me.lock = false;
    })
  }
}
module.exports = PM2Cooperation;
