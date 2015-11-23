var updateByType = require('stormbringer/update-by-type');
var dateUtils = require('./date-utils');
var setMonth = require('./set-month');

function toggleOpenDatePicker(model) {
  if (!model.open) {
    model.isDatePickerTop = model.isElementInBottomHalf;
  }
  model.open = !model.open;
  return model;
}

function relativePositionChange(model, payload) {
  model.isElementInBottomHalf = payload.isElementInBottomHalf;
  return model;
}

function changeHighlighted(model, payload) {
  model.highlightedDayIndex = payload.dayIndex;
  return model;
}

function nextMonth(model) {
  var nextDate = dateUtils.getNextDate(model.displayedDate.month, model.displayedDate.year);
  setMonth(model, nextDate.month, nextDate.year);
  model.displayedDate = nextDate;
  return model
}

function lastMonth(model) {
  var lastDate = dateUtils.getLastDate(model.displayedDate.month, model.displayedDate.year);
  setMonth(model, lastDate.month, lastDate.year);
  model.displayedDate = lastDate;
  return model
}

module.exports = updateByType({
  toggleOpenDatePicker: toggleOpenDatePicker,
  relativePositionChange: relativePositionChange,
  changeHighlighted: changeHighlighted,
  nextMonth: nextMonth,
  lastMonth: lastMonth
});
