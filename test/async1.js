bommon.register('async1', function (module, exports, require) {
  console.log('async1 start');
  module.exports = {
    key: 'async1'
  };
});
