var dateUtils = require('./date-utils');

module.exports = function setMonth(model, month, year) {
  model.years[year] = model[year] || {};
  model.years[year][month] =
    dateUtils.generateMonthFactory(model.currentDay, model.currentMonth, model.currentYear)(month, year);

  return model;
}
