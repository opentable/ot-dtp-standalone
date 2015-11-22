module.exports = function throttle(args) {
  var isThrottled = false;
  setInterval(function() {
    isThrottled = false;
  }, args.interval);

  return function throttledFunction() {
    if (!isThrottled) {
      isThrottled = true;
      args.fn.apply(null, arguments);
    }
  };
};
