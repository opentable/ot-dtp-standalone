var h = require('stormbringer/h');
var buildStyle = require('../build-style');

var styles = {
  picker: buildStyle({}, ['pickerSelector']),
  pickerLink: buildStyle({}, ['pickerLabel']),
  select: buildStyle({}, ['otSelect']),
  option: buildStyle()
};

function option(count) {
  return h('option', {
    value: count,
    style: styles.option
  }, count + ' people');
}

module.exports = function dtpPickerForm(store) {
  var options = [1, 2, 3].map(option);

  return h('div', {
      style: styles.picker
    }, [
      h('a', {
        style: styles.pickerLink
      }, store.model.partySize + ' people'),

      h('select', {
        style: styles.select
      }, options)
    ]
  );
}
