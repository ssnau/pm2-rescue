var fs = require('fs');
function readJSON(file) {
  var content;
  try {
    content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    // do nothing
  }
  return {};
}
function writeJSON(file, obj) {
  var str = JSON.stringify(obj, null, 2);
  fs.writeFileSync(file, str, 'utf8');
}

function mergeJSON(file, obj) {
  var json = readJSON(file);
  Object.keys(obj).forEach(function(key) {
    json[key] = obj[key];
  });
  writeJSON(file, json);
}

function deleteKey(file, key) {
  var json = readJSON(file);
  delete json[key];
  writeJSON(file, json);
}

function formatTime(time) {
   time = new Date(time);
   var Y = time.getFullYear();
   var M = time.getMonth() + 1;
   var D = time.getDate();
   var h = time.getHours();
   var m = time.getMinutes();
   var s = time.getSeconds();
   var nm = {'0': '00', '1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', '9': '09'};

   return [Y, '-', M, '-', D, ' ', h, ':', m, ':', s].map(x => nm[x] || x).join('');
}

module.exports = {
  readJSON,
  writeJSON,
  mergeJSON,
  deleteKey,
  formatTime
};
