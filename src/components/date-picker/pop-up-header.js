var hg = require('mercury');
var translations = require('./translations');
var buildStyle = require('./build-style');
var merge = require('ramda/src/merge');

var h = hg.h;

var styles = {
  popUpHeader: buildStyle({
    textAlign: 'center',
    position: 'relative'
  })
};
module.exports = function popUpHeader(state) {
  var translation = merge(translations['en-US'], translations[state.viewModel.locale] || {});
  var displayedDate = state.viewModel.displayedDate;
  var month = state
    .viewModel
    .years[displayedDate.year][displayedDate.month];

  return h('div', {
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
  ]);
};
