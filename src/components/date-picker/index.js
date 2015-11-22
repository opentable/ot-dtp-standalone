var h = require('stormbringer/h');
var send = require('stormbringer/send');
var buildStyle = require('../../build-style');
var popUp = require('./pop-up');
var dateFormat = require('dateformat');
var languages = require('../../languages');
var translations = require('./translations');

var styles = {
  datePicker: buildStyle({
    borderLeft: '1px solid rgba(0,0,0,.08)'
  }, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(store) {
  var selectedDate = store.model.selectedDate;
  var date = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
  var language = languages[store.model.language];
  var translation = translations[store.model.locale];

  // FIXME: should only have to run on state initialization
  dateFormat.i18n = {
    dayNames: translation.weekdaysShort.concat(translation.weekdaysFull),
    monthNames: translation.monthsShort.concat(translation.monthsFull)
  };

  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink,
      onclick: send({ store: store,  type: 'toggleOpenDatePicker' }),
    }, dateFormat(date, language.dateFormat)),
    popUp(store)
  ]);
}
