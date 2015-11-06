var monthDays = require('month-days');
var times = require('ramda/src/times');

function getFirstDayOfMonth(month, year) {
  return new Date(year + "-" + month + "-01").getDay();
}

function getLastDayOfMonth(numberOfDays, month, year) {
  return new Date(year + "-" + month + "-" + numberOfDays).getDay();
}

function modulo(n, m) {
  return ((n % m) + m) % m;
}

module.exports.generateMonth = function generateMonth(month, year) {
  var lastMonth = modulo(month - 1, 12);
  var nextMonth = modulo(month + 1, 12);

  var nextMonthYear = month === 11 ? year + 1 : year;
  var lastMonthYear = month === 0 ? year - 1 : year;

  var numberOfDays = monthDays(month, year);
  var numberOfDaysNextMonth = monthDays(nextMonth, nextMonthYear);
  var numberOfDaysLastMonth = monthDays(lastMonth, lastMonthYear);

  // an index representing the day of the week e.g. monday = 0, tuesday = 1
  var firstDayOfMonth = getFirstDayOfMonth(month, year);
  var lastDayOfMonth = getLastDayOfMonth(numberOfDays, month, year);

  // numberOfDaysLastMonth = 31
  // numberOfRowsInCalendar = 6
  // numberOfDaysInCalendar = numberOfRowsInCalendar * 7
  // firstDayOfMonth = 0
  // currentMonth = 1, february
  // firstDayInCalender = 6
  // numberOfDaysShownFromLastMonth = 7 + firstDayOfMonth - firstDayInCalender
  // numberOfDaysShownFromNextMonth = numberOfDaysInCalendar - (numberOfDaysShownFromLastMonth + numberOfDays)

  var lastMonthDays = times(function buildLastMonthDays(dayIndex) {
    numberOfDaysLastMonth - firstDayOfMonth - 1 + dayIndex;
  }, firstDayOfMonth + 1);
}
