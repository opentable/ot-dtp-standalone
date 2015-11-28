var hg = require('mercury');
var buildTranslation = require('./buildTranslation');
var splitEvery = require('ramda/src/splitEvery');
var merge = require('ramda/src/merge');
var buildStyle = require('./build-style');
var popUpHeader = require('./pop-up-header');
var tableBody = require('./table-body');

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
  popUpTable: buildStyle({
    boxSizing: 'border-box',
    textAlign: 'center',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
    fontSize: 'inherit',
    width: '100%',
    marginTop: '1rem',
  })
};

module.exports = function popUp(state) {
  var displayedDate = state.viewModel.displayedDate;
  var month = state
    .viewModel
    .years[displayedDate.year][displayedDate.month];

  var translation = buildTranslation(state.viewModel.locale);
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
    var translateY = state.viewModel.isDatePickerTop ? '1' : '-1';
    extendedPopUpStyle.transform = 'translateY(' + translateY + 'em) perspective(600px)';
  }
  extendedPopUpStyle.transition = 'transform 0.15s ease-out, opacity 0.15s ease-out, position 0.15s ease-out, height 0s 0.15s';
  var popUpStyle = merge(styles.popUp, extendedPopUpStyle);

  return h('div', {
    style: popUpStyle
  }, [
    popUpHeader(state),

    h('table', {
      style: styles.popUpTable
    }, [
      h('thead', h('tr', { style: { height: '2em' } }, dayThs)),
      tableBody(state),
    ])
  ]);
}
