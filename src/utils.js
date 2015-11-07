var monthDays = require('month-days');
var times = require('ramda/src/times');
var settings = require('./settings');

function getFirstDayOfMonth(month, year) {
  return new Date(year + "-" + (month + 1) + "-01").getDay();
}

function getLastDayOfMonth(numberOfDays, month, year) {
  return new Date(year + "-" + (month + 1) + "-" + (numberOfDays + 1)).getDay();
}

function modulo(n, m) {
  return ((n % m) + m) % m;
}

// TODO: add memoization
module.exports.generateMonthFactory =
  function generateMonthFactory(currentDay, currentMonth, currentYear) {
    return function generateMonth(month, year) {
      var lastMonth = modulo(month - 1, 12);
      var nextMonth = modulo(month + 1, 12);

      var nextMonthYear = month === 11 ? year + 1 : year;
      var lastMonthYear = month === 0 ? year - 1 : year;

      var numberOfDays = monthDays(month, year);
      var numberOfDaysNextMonth = monthDays(nextMonth, nextMonthYear);
      var numberOfDaysLastMonth = monthDays(lastMonth, lastMonthYear);

      var firstDayOfMonth = getFirstDayOfMonth(month, year);
      var lastDayOfMonth = getLastDayOfMonth(numberOfDays, month, year);

      var numberOfDaysShownFromLastMonth = modulo(7 + firstDayOfMonth - settings.firstDayInCalendar, 7);
      var numberOfDaysShownFromNextMonth =
        settings.numberOfDaysInCalendar - (numberOfDaysShownFromLastMonth + numberOfDays);

      var daysLastMonth = times(function buildLastMonthDays(dayIndex) {
        return {
          dayOfMonth: numberOfDaysLastMonth - numberOfDaysShownFromLastMonth + dayIndex + 1,
          isDisabled: true
        };
      }, numberOfDaysShownFromLastMonth);

      var daysThisMonth = times(function buildDays(dayIndex) {
        return {
          dayOfMonth: dayIndex + 1,
          isDisabled: dayIndex < currentDay
        };
      }, numberOfDays);

      var daysNextMonth = times(function buildNextMonthDays(dayIndex) {
        return {
          dayOfMonth: dayIndex + 1,
          isDisabled: true
        };
      }, numberOfDaysShownFromNextMonth);

      return {
        name: 'November 2015',
        displayedDays: daysLastMonth.concat(daysThisMonth).concat(daysNextMonth)
      };
    }
  };
