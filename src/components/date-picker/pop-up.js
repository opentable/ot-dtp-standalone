var hg = require('mercury');
var splitEvery = require('ramda/src/splitEvery');
var merge = require('ramda/src/merge');
var translations = require('./translations');
var buildStyle = require('./build-style');

var h = hg.h;
var styles = {
  popUp: buildStyle({
    width: '22em',
    height: '18em',
    position: 'absolute',
    left: 'calc(50% - 11rem)',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    padding: '1em',
    boxSizing: 'border-box',
  }),
  popUpHeader: buildStyle({
    textAlign: 'center',
    position: 'relative'
  }),
  popUpTable: buildStyle({
    boxSizing: 'border-box',
    textAlign: 'center',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
    fontSize: 'inherit',
    width: '100%',
    marginTop: '1rem',
  }),
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

// selected background color: #DA3743
//
module.exports = function popUp(state) {
  var displayedDate = state.viewModel.displayedDate;
  var month = state
    .viewModel
    .years[displayedDate.year][displayedDate.month];

  var translation = merge(translations['en-US'], translations[state.viewModel.language] || {});

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

  // FIXME: start week based on setting
  var dayThs = translation.weekdaysShort.map(function buildDayTh(day) {
    return h('th', day);
  });

  var extendedPopUpStyle = {};
  if (state.viewModel.isDatePickerTop) {
    extendedPopUpStyle.top = '-' + styles.popUp.height;
  }

  if (!state.viewModel.open) {
    extendedPopUpStyle.height = 0;
    extendedPopUpStyle.opacity = 0;
    var translateY = state.viewModel.isElementInBottomHalf ? '1' : '-1';
    extendedPopUpStyle.transform = 'translateY(' + translateY + 'em) perspective(600px)';
  } else {
    extendedPopUpStyle.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out, position 0.15s ease-out, height 0s 0.15s';
  }
  var popUpStyle = merge(styles.popUp, extendedPopUpStyle);

  return h('div', {
    style: popUpStyle
  }, [
    h('div', {
      style: styles.popUpHeader
    }, [
      translation.monthsFull[displayedDate.month] + ' ' + displayedDate.year,
      h('div', {
        style: {
          width: '30px',
          height: '30px',
          float: 'left',
          backgroundColor: 'black'
        },
        'ev-click': hg.send(state.channels.lastMonth)
      }),
      h('div', {
        style: {
          height: '30px',
          width: '30px',
          float: 'right',
          backgroundColor: 'black'
        },
        'ev-click': hg.send(state.channels.nextMonth)
      })
    ]),

    h('table', {
      style: styles.popUpTable
    }, [
      h('thead', h('tr', { style: { height: '2em' } }, dayThs)),
      h('tbody', dayTrs)
    ])
  ]);
}
