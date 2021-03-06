var PMC = require('../');
var util = require('../util');
var path = require('path');
var assert = require('assert');
var cfile = path.join(__dirname, '.pmc_watch');

describe('should auto save brothers', function () {
  var p1;
  var rcalledInfo = false;
  var rcalledKey = false;
  beforeEach(function () {
    p1 = new PMC({
      filename: cfile,
      pm_id: 1,
      timeout: 2000,
      restart: function (key, info) {
        rcalledInfo = info;
        rcalledKey = key;
        return Promise.resolve({code: 0, out: ''});
      }
    });

  });
  it("should call restart function", function (done) {
    var info = { ts: Date.now() - 3000 };
    util.writeJSON(cfile, {'3': info });
    rcalledInfo = false;
    rcalledKey = false;
    p1.rescue().then(function() {
      assert.deepEqual(rcalledInfo, info);
      assert.deepEqual(rcalledKey, '3');
      done();
    });
  });

  it("should not call restart function if not timeout", function (done) {
    var info = { ts: Date.now()};
    util.writeJSON(cfile, '{}'); // empty
    util.writeJSON(cfile, {'3': info });
    rcalledInfo = false;
    rcalledKey = false;
    p1.rescue().then(function() {
      assert.deepEqual(rcalledInfo, false);
      assert.deepEqual(rcalledKey, false);
      done();
    });
  });

  it("should delete failed key", function (done) {
    p1.restart = function () {
        return Promise.resolve({code: 1, out: ''});
    }
    var info = { ts: Date.now() - 3000 };
    util.writeJSON(cfile, {'3': info });
    p1.update();
    p1.rescue().then(function() {
      var json = util.readJSON(cfile);
      assert.equal(json[3], void 0);
      assert.ok(json[1]);
      done();
    });
  });

  it('should rescue if the app limboed', function (done) {
    p1.timeout = 1000;
    // the restart will finally be called
    p1.restart = function () {
      done();
      return Promise.resolve({code: 1, out: ''});
    };
    p1.update();
  });

  it('should not rescue twice within one timeout', function (done) {
    p1.timeout = 500;
    var count = 0;
    // the restart will finally be called
    p1.restart = function () {
      count++;
      return Promise.resolve({code: 1, out: ''});
    };
    var info = { ts: Date.now() - 3000 };
    util.writeJSON(cfile, {'3': info });
    p1.rescue();
    setTimeout(() => p1.rescue());
    setTimeout(function () {
      assert.equal(count, 1);
      done();
    }, 1400);
  });
});
