var hg = require('mercury');
var buildStyle = require('../../build-style');
var popUp = require('./pop-up');
var dateFormat = require('dateformat');
var translations = require('./translations');

var h = hg.h;

var styles = {
  datePicker: buildStyle({
    borderLeft: '1px solid rgba(0,0,0,.08)'
  }, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  var selectedDate = state.viewModel.selectedDate;
  var date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
  var translation = translations[state.viewModel.language];

  debugger;
  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink,
      'ev-click': hg.send(state.channels.toggleDatePicker)
    }, dateFormat(date, translation.format)),
    popUp(state)
  ]);
}
