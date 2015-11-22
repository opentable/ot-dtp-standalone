var mountApp = require('stormbringer/mount');
var buildStore = require('stormbringer/build-store');
var buildInitialModel = require('./build-initial-model');
var pickerForm = require('./components/picker-form');
var update = require('./update');
var init = require('./init');
var position = require('./position');

function mount(selector) {
  var el = global.document.querySelector(selector);

  var initialModel = buildInitialModel({
    currentDay: 1,
    currentMonth: 10,
    currentYear: 1991,
    isElementInBottomHalf: position.getIsElementInBottomHalf(el)
  });

  var store = buildStore({
    model: initialModel,
    update: update
  });

  init({ el: el , store: store });
  return mountApp({ el: el, render: pickerForm, store: store });
}

module.exports = {
  mount: mount,
  init: init
};
