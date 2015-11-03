var h = require('mercury').h;
var partySizePicker = require('./party-size-picker');
var buildStyle = require('../build-style');

var styles = {
  datePicker: buildStyle({}, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink
    }, 'Oct 29, 2015'),
  ]);
}
