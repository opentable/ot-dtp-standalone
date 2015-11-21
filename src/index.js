var sb = require('stormbringer');
var buildInitialModel = require('./build-initial-model');
var pickerForm = require('./components/picker-form');
var update = require('./update');

function mount(selector) {
  var el = global.document.querySelector(selector);

  var initialModel = buildInitialModel({
    currentDay: '1',
    currentMonth: '12',
    currentYear: '1991'
  });

  var store = sb.buildStore({
    model: initialModel,
    update: update
  });

  return sb.mount({ el: el, render: pickerForm, store: store });
}

module.exports = {
  mount: mount
};

// var hg = require('mercury');
// var pickerForm = require('./components/picker-form');
// var utils = require('./utils');
// var merge = require('ramda/src/merge');

// var now = new Date();
// var currentDay = now.getDay();
// var currentMonth = now.getMonth();
// var currentYear = now.getFullYear();
// var generateMonth = utils.generateMonthFactory(currentDay, currentMonth, currentYear);

// var h = hg.h;

// function setMonth(collection, month, year) {
//   collection[year] = collection[currentYear] || {};
//   collection[year][month] = generateMonth(month, year);
// }

// function buildInitialViewModel(opts) {

//   var initialViewModel = {
//     autocompletePlaceholder: 'Location or Restaurant',
//     date: '2015-10-10',
//     open: hg.value(true),
//     isDatePickerTop: hg.value(opts.isElementInBottomHalf || 'false'),
//     isElementInBottomHalf: hg.value(opts.isElementInBottomHalf || 'false'),
//     displayedDate: hg.struct({
//       month: hg.value(currentMonth),
//       year: hg.value(currentYear)
//     }),
//     findATable: 'Find a Table',
//     // locale: 'en-US',
//     // language: 'en',
//     locale: 'ja-JP',
//     language: 'ja',
//     partySize: 2,
//     partySizeLargerParty: 'Larger party',
//     partySizePlural: '2 people',
//     partySizeSingular: '1 person',
//     // should be the index of the td highlighted by the user's mouse
//     highlightedDayIndex: hg.value(null),
//     selectedDate: hg.struct({
//       isSelected: hg.value(true),
//       year: hg.value(2015),
//       month: hg.value(currentMonth),
//       day: hg.value(currentDay)
//     }),
//     showLargerParty: true,
//     showSearch: false,
//     time: '23:30',
//     timeOptions: [{ value: '23:30', displayValue: '23:30' }],
//     timezoneOffset: -420,
//     years: {}
//   };

//   setMonth(initialViewModel.years, currentMonth, currentYear);
//   return initialViewModel;
// }

// function nextMonth(state) {
//   var nextDate = utils.getNextDate(state.viewModel.displayedDate.month(), state.viewModel.displayedDate.year());
//   setMonth(state.viewModel.years, nextDate.month, nextDate.year);
//   state.viewModel.displayedDate.set(nextDate);
// }

// function lastMonth(state) {
//   var lastDate = utils.getLastDate(state.viewModel.displayedDate.month(), state.viewModel.displayedDate.year());
//   setMonth(state.viewModel.years, lastDate.month, lastDate.year);
//   state.viewModel.displayedDate.set(lastDate);
// }

// function mouseoutDay(state, dayIndex) {
//   state.viewModel.highlightedDayIndex.set(null);
// }

// function mouseoverDay(state, dayIndex) {
//   state.viewModel.highlightedDayIndex.set(dayIndex);
// }

// function toggleDatePicker(state) {
//   if (!state.viewModel.open()) {
//     state.viewModel.isDatePickerTop.set(state.viewModel.isElementInBottomHalf());
//   }
//   state.viewModel.open.set(!state.viewModel.open());
// }

// function relativePositionChange(state, isElementInBottomHalf) {
//   state.viewModel.isElementInBottomHalf.set(isElementInBottomHalf);
// }

// function getInitialAppState(opts) {
//   return hg.state({
//     viewModel: hg.struct(buildInitialViewModel(opts)),
//     channels: {
//       relativePositionChange: relativePositionChange,
//       mouseoverDay: mouseoverDay,
//       mouseoutDay: mouseoutDay,
//       toggleDatePicker: toggleDatePicker,
//       // resizeViewport: resizeViewport,
//       // scroll: scroll,
//       nextMonth: nextMonth,
//       lastMonth: lastMonth
//     }
//   });
// }

// function render(state) {
//   return pickerForm(state);
// }

// var additionalEvents = ['mouseover', 'mouseout'];

// function app(elem, observ, render, opts) {
//   if (!elem) {
//     throw new Error(
//       'Element does not exist. ' +
//       'Mercury cannot be initialized.');
//   }

//   var delegator = hg.Delegator(opts);
//   for (i = 0; i < additionalEvents.length; i++) {
//     delegator.listenTo(additionalEvents[i]);
//   }

//   var loop = hg.main(observ(), render, merge({
//     diff: hg.diff,
//     create: hg.create,
//     patch: hg.patch
//   }, opts));

//   elem.appendChild(loop.target);

//   return observ(loop.update);
// }

// function getPosition(element) {
//   var xPosition = 0;
//   var yPosition = 0;

//   while(element) {
//     xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
//     yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
//     element = element.offsetParent;
//   }
//   return { x: xPosition, y: yPosition };
// }

// function getViewportDimensions() {
//   var elem = (document.compatMode === "CSS1Compat") ?
//     document.documentElement :
//     document.body;

//   return {
//     height: elem.clientHeight,
//     width: elem.clientWidth
//   };
// }

// function getPageOffset() {
//   var supportPageOffset = window.pageXOffset !== undefined;
//   var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

//   var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
//   var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

//   return { x: x, y: y };
// }

// function getIsElementInBottomHalf(el) {
//   var viewportDimensions = getViewportDimensions();
//   var position = getPosition(el);
//   var pageOffset = getPageOffset();

//   return position.y > viewportDimensions.height / 2;
// }

// module.exports = {
//   render: function(selector) {
//     var el = document.querySelector(selector);

//     var isElementInBottomHalf = getIsElementInBottomHalf(el);

//     var opts = {
//       isElementInBottomHalf: isElementInBottomHalf,
//     };
//     var state = getInitialAppState(opts);

//     var timer;
//     window.onscroll = function() {
//       if(timer) {
//         window.clearTimeout(timer);
//       }

//       timer = window.setTimeout(function() {
//         relativePositionChange(state, getIsElementInBottomHalf(el));
//       }, 100);
//     };

//     window.onresize = function() {
//       if(timer) {
//         window.clearTimeout(timer);
//       }

//       timer = window.setTimeout(function() {
//         relativePositionChange(state, getIsElementInBottomHalf(el));
//       }, 100);
//     };

// //     window.addEventListener("optimizedScroll", function() {
// //       pageOffset = getPageOffset();
// //       console.log('loc1', pageOffset.y);
// //       state.viewModel.pageOffsetY.set(pageOffset.y);
// //     });

//     app(el, state, render);
//   }
// };
