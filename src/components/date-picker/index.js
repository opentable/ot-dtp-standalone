var h = require('mercury').h;
var buildStyle = require('../../build-style');
var popUp = require('./pop-up');

var styles = {
  datePicker: buildStyle({
    borderLeft: '1px solid rgba(0,0,0,.08)'
  }, ['pickerSelector']),
  datePickerLink: buildStyle({}, ['pickerLabel'])
};

module.exports = function datePicker(state) {
  return h('div', {
    style: styles.datePicker
  }, [
    h('a', {
      style: styles.datePickerLink
    }, 'Oct 29, 2015'),
    popUp(state)
  ]);
}

// module.exports = {
//   // render: ,
//   // initialState: ,
//   // channels: ,
// }
