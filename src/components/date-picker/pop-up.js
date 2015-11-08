var hg = require('mercury');
var splitEvery = require('ramda/src/splitEvery');
var merge = require('ramda/src/merge');

var h = hg.h;
var styles = {
  popUp: {
    width: '22em',
    maxHeight: '22em',
    position: 'absolute',
    left: 'calc(50% - 11rem)',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    padding: '1em',
    boxSizing: 'border-box',
  },
  popUpHeader: {
    boxSizing: 'border-box',
    textAlign: 'center',
    position: 'relative'
  },
  popUpTable: {
    boxSizing: 'border-box',
    textAlign: 'center',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
    fontSize: 'inherit',
    width: '100%',
    marginTop: '1rem',
  },
  dayTd: {
    height: '2em',
    width: '2em',
    lineHeight: 1.95
  }
};

module.exports = function popUp(state) {
  var displayedDate = state.viewModel.displayedDate;
  var month = state
    .viewModel
    .years[displayedDate.year][displayedDate.month];

  var dayIndex = 0;
  // use on mouseover
  var dayTrs = splitEvery(7, month.displayedDays)
    .map(function trFromWeek(week) {
      var dayTds = week.map(function tdFromDay(day) {
        var style = state.viewModel.highlightedDayIndex === dayIndex ?
          merge(styles.dayTd, {
            backgroundColor: 'red'
          }) :
          styles.dayTd;

        var td = h('td', {
          style: style,
          'ev-mouseout': hg.send(state.channels.mouseoutDay, dayIndex),
          'ev-mouseover': hg.send(state.channels.mouseoverDay, dayIndex),
        }, String(day.dayOfMonth));

        dayIndex++;
        return td;
      });
      return h('tr', dayTds);
    });

  // FIXME: start week based on setting
  var dayThs = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(function buildDayTh(day) {
    return h('th', day);
  });

  return h('div', {
    style: styles.popUp
  }, [
    h('div', {
      style: styles.popUpHeader
    }, [
      month.name,
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
      h('thead', h('tr', dayThs)),
      h('tbody', dayTrs)
    ])
  ]);
}
