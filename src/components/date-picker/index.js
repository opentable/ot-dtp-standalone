var hg = require('mercury');
var buildStyle = require('../../build-style');
var popUp = require('./pop-up');

var h = hg.h;

var styles = {
  datePicker: buildStyle({
    borderLeft: '1px solid rgba(0,0,0,.08)'
  }, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  return h('div', {
    style: styles.datePicker,
    'ev-click': hg.send(state.channels.toggleDatePicker)
  }, [
    h('a', {
      style: styles.datePickerLink
    }, 'Oct 29, 2015'),
    popUp(state)
  ]);
}
