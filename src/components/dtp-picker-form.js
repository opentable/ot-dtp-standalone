var h = require('mercury').h;
var partySizePicker = require('./party-size-picker');
var datePicker = require('./date-picker');
var buildStyle = require('../build-style');

module.exports = function dtpPickerForm(state) {
  return h('form', {
    style: buildStyle()
  }, [
    partySizePicker(state),
    datePicker(state)
  ]);
}
