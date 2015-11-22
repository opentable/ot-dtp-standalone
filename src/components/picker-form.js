var h = require('stormbringer/h');
var buildStyle = require('../build-style');
var partySizePicker = require('./party-size-picker');
var datePicker = require('./date-picker');

module.exports = function dtpPickerForm(store) {
  return h('form', {
    style: buildStyle({
      height: '3em',
      width: '59.5em',
    })
  }, [
    partySizePicker(store),
    datePicker(store)
  ]);
}

// var h = require('mercury').h;
// var partySizePicker = require('./party-size-picker');
// var datePicker = require('./date-picker');
// var buildStyle = require('../build-style');

// module.exports = function dtpPickerForm(state) {
//   return h('form', {
//     style: buildStyle({
//       height: '3em',
//       width: '59.5em',
//     })
//   }, [
//     partySizePicker(state),
//     datePicker(state)
//   ]);
// }
