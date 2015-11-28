var hg = require('mercury');
var buildTranslation = require('./buildTranslation');
var buildStyle = require('./build-style');
var splitEvery = require('ramda/src/splitEvery');
var merge = require('ramda/src/merge');

var h = hg.h;

var styles = {
  dayTd: buildStyle({
    lineHeight: 1.95
  }),
  dayTdContent: buildStyle({
    margin: '0 auto',
    height: '2em',
    width: '2em',
    borderRadius: '100%'
  })
};

var colors = {
  primary: '#DA3743',
  faded: '#f7d7d9'
};

module.exports = function tableBody(state) {
  var displayedDate = state.viewModel.displayedDate;
  var month = state
    .viewModel
    .years[displayedDate.year][displayedDate.month];

  var translation = buildTranslation(state.viewModel.locale);

  var dayIndex = 0;
  // use on mouseover
  var dayTrs = splitEvery(7, month.displayedDays)
    .map(function trFromWeek(week) {
      var dayTds = week.map(function tdFromDay(day) {
        var styleTdContent = state.viewModel.highlightedDayIndex === dayIndex ?
          merge(styles.dayTdContent, {
            backgroundColor: colors.faded,
            color: colors.primary
          }) :
          styles.dayTdContent;

        var td = h('td', {
          style: styles.dayTd,
          'ev-mouseout': hg.send(state.channels.mouseoutDay, dayIndex),
          'ev-mouseover': hg.send(state.channels.mouseoverDay, dayIndex),
        }, h('div', { style: styleTdContent }, String(day.dayOfMonth)));

        dayIndex++;
        return td;
      });
      return h('tr', dayTds);
    });

  return h('tbody', dayTrs)
}
