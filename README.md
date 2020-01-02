# bommon

CommonJS in browser.

Support IE.

# Usage

First add script tag in HTML.

``` html
<script src="bommon.js"></script>
```

Common Usage.

``` js
bommon.register('main', function (module, exports, require) {
  document.write('main starting<br/>');
  var a = require('a');
  var b = require('b');
  document.write('in main, a.done = ' + a.done + ', b.done = ' + b.done + '<br/>');
});

bommon.register('a', function (module, exports, require) {
  document.write('a starting<br/>');
  exports.done = false;
  var b = require('b');
  document.write('in a, b.done = ' + b.done + '<br/>');
  exports.done = true;
  document.write('a done<br/>');
});

bommon.register('b', function (module, exports, require) {
  document.write('b starting<br/>');
  exports.done = false;
  var a = require('a');
  document.write('in b, a.done = ' + a.done + '<br/>');
  exports.done = true;
  document.write('b done<br/>');
});

bommon.runAsMain('main');
```

Output:

```
main starting
a starting
b starting
in b, a.done = false
b done
in a, b.done = true
a done
in main, a.done = true, b.done = true
```

Support dynamic import like ES `import()`.

Global call:

``` js
// /root/path/to/async-module.js
bommon.register('moduleId', function (module, exports, require) {
  module.exports = { key: 'value' };
});

// in your page
bommon.dynamicImport('/root/path/to/async-module.js', 'moduleId').then(function (mod) {
  console.log(mod.key); // value
});
```

Call in module:

``` js
// /root/path/to/async-module.js
bommon.register('moduleId', function (module, exports, require) {
  module.exports = { key: 'value' };
});

// in your module
bommon.register('mainModule', function (module, exports, require) {
  require.dynamicImport('/root/path/to/async-module.js', 'moduleId').then(function (mod) {
    console.log(mod.key); // value
  });
})
```

See `test/bommon.html`.

## API

[Document](./docs/api/bommon.md)

## License

* MIT
