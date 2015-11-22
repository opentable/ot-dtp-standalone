var updateByType = require('stormbringer/update-by-type');

function toggleOpenDatePicker(model) {
  if (!model.open) {
    model.isDatePickerTop = model.isElementInBottomHalf;
  }
  model.open = !model.open;
  return model;
}

function relativePositionChange(model, action) {
  model.isElementInBottomHalf = action.payload.isElementInBottomHalf;
  return model;
}

module.exports = updateByType({
  toggleOpenDatePicker: toggleOpenDatePicker,
  relativePositionChange: relativePositionChange
});
