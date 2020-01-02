!function () {
  var bommon;
  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && typeof require === 'function') {
    bommon = require('../lib/index.js');
  } else {
    bommon = window.bommon;
  }

  function log(msg) {
    if (typeof document !== 'undefined') {
      document.write(msg + '<br/>');
    } else {
      console.log(msg);
    }
  }

  if (typeof window !== 'undefined' && typeof Promise === 'function') {
    bommon.dynamicImport('./async1.js', 'async1').then(function (mod) {
      console.log(mod);
    });
    bommon.dynamicImport('./async1.js', 'async1').then(function (mod) {
      console.log(mod);
    });
  }

  bommon.register('main', function (module, exports, require) {
    log('main starting');
    var a = require('a');
    var b = require('b');
    log('in main, a.done = ' + a.done + ', b.done = ' + b.done + '');

    if (typeof window !== 'undefined' && typeof Promise === 'function') {
      require.dynamicImport('./async3.js', 'async3').then(function (mod) {
        console.log(mod);
      });
      require.dynamicImport('./async3.js', 'async3').then(function (mod) {
        console.log(mod);
      });
    }
  });

  bommon.register('a', function (module, exports, require) {
    log('a starting');
    exports.done = false;
    var b = require('b');
    log('in a, b.done = ' + b.done + '');
    exports.done = true;
    log('a done');
  });

  bommon.register('b', function (module, exports, require) {
    log('b starting');
    exports.done = false;
    var a = require('a');
    log('in b, a.done = ' + a.done + '');
    exports.done = true;
    log('b done');
  });

  bommon.runAsMain('main');

  if (typeof window !== 'undefined' && typeof Promise === 'function') {
    bommon.dynamicImport('./async2.js', 'async2').then(function (mod) {
      console.log(mod);
    });
    bommon.dynamicImport('./async2.js', 'async2').then(function (mod) {
      console.log(mod);
    });
  }

}();
