var hg = require('mercury');
var pickerForm = require('./components/picker-form');
var utils = require('./utils');
var merge = require('ramda/src/merge');
var channels = require('./channels');

var generateMonth;

var h = hg.h;

function setMonth(collection, month, year) {
  collection[year] = collection[year] || {};
  collection[year][month] = generateMonth(month, year);
}

function buildInitialViewModel(opts) {
  var initialViewModel = {
    autocompletePlaceholder: 'Location or Restaurant',
    date: '2015-10-10',
    open: hg.value(true),
    isDatePickerTop: hg.value(opts.isElementInBottomHalf || 'false'),
    isElementInBottomHalf: hg.value(opts.isElementInBottomHalf || 'false'),
    displayedDate: hg.struct({
      month: hg.value(opts.currentMonth),
      year: hg.value(opts.currentYear)
    }),
    findATable: 'Find a Table',
    // locale: 'en-US',
    // language: 'en',
    locale: 'ja-JP',
    language: 'ja',
    partySize: 2,
    partySizeLargerParty: 'Larger party',
    partySizePlural: '2 people',
    partySizeSingular: '1 person',
    // should be the index of the td highlighted by the user's mouse
    highlightedDayIndex: hg.value(null),
    selectedDate: hg.struct({
      isSelected: hg.value(true),
      year: hg.value(2015),
      month: hg.value(opts.currentMonth),
      day: hg.value(opts.currentDay)
    }),
    showLargerParty: true,
    showSearch: false,
    time: '23:30',
    timeOptions: [{ value: '23:30', displayValue: '23:30' }],
    timezoneOffset: -420,
    years: {}
  };

  setMonth(initialViewModel.years, opts.currentMonth, opts.currentYear);
  return initialViewModel;
}

function getInitialAppState(opts) {
  return hg.state({
    viewModel: hg.struct(buildInitialViewModel(opts)),
    channels: channels
  });
}

function render(state) {
  return pickerForm(state);
}

var additionalEvents = ['mouseover', 'mouseout'];

function app(elem, observ, render, opts) {
  if (!elem) {
    throw new Error(
      'Element does not exist. ' +
      'Mercury cannot be initialized.');
  }

  var delegator = hg.Delegator(opts);
  for (i = 0; i < additionalEvents.length; i++) {
    delegator.listenTo(additionalEvents[i]);
  }

  var loop = hg.main(observ(), render, merge({
    diff: hg.diff,
    create: hg.create,
    patch: hg.patch
  }, opts));

  elem.appendChild(loop.target);

  return observ(loop.update);
}

function getPosition(element) {
  var xPosition = 0;
  var yPosition = 0;

  while(element) {
    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
    element = element.offsetParent;
  }
  return { x: xPosition, y: yPosition };
}

function getViewportDimensions() {
  var elem = (document.compatMode === "CSS1Compat") ?
    document.documentElement :
    document.body;

  return {
    height: elem.clientHeight,
    width: elem.clientWidth
  };
}

function getPageOffset() {
  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

  var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
  var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  return { x: x, y: y };
}

function getIsElementInBottomHalf(el) {
  var viewportDimensions = getViewportDimensions();
  var position = getPosition(el);
  var pageOffset = getPageOffset();

  return position.y > viewportDimensions.height / 2;
}

module.exports = {
  render: function(selector) {
    var el = document.querySelector(selector);

    var isElementInBottomHalf = getIsElementInBottomHalf(el);

    var now = new Date();
    var opts = {
      isElementInBottomHalf: isElementInBottomHalf,
      currentDay: now.getDay(),
      currentMonth: now.getMonth(),
      currentYear: now.getFullYear(),
    };

    generateMonth = utils.generateMonthFactory(opts.currentDay, opts.currentMonth, opts.currentYear);
    var state = getInitialAppState(opts);

    var timer;
    window.onscroll = function() {
      if(timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(function() {
        channels.relativePositionChange(state, getIsElementInBottomHalf(el));
      }, 100);
    };

    window.onresize = function() {
      if(timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(function() {
        channels.relativePositionChange(state, getIsElementInBottomHalf(el));
      }, 100);
    };

    app(el, state, render);
  }
};
