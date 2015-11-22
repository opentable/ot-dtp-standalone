var rateLimit = require('function-rate-limit');
var position = require('./position');
var throttle = require('./throttle');

var sendPositionChange = throttle({
  fn: function(args) {
    args.store.send({
      type: 'relativePositionChange',
      payload: {
        isElementInBottomHalf: args.isElementInBottomHalf
      }
    });
  },
  interval: 200
});

module.exports = function init(args) {
  var sendPositionChangeToStore = function() {
    sendPositionChange({
      store: args.store,
      isElementInBottomHalf: position.getIsElementInBottomHalf(args.el)
    });
  };

  window.onscroll = sendPositionChangeToStore;
  window.onresize = sendPositionChangeToStore;
};
