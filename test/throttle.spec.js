var sinon = require('sinon');
var throttle = require(__BASE + '/src/throttle');
var helper = require('./helper');

var expect = helper.expect;

describe('throttle', function() {
  var throttledStub, clock;

  before(function() {
    clock = sinon.useFakeTimers();
    throttledStub = sinon.stub();

    var throttledFunction = throttle({ fn: throttledStub, interval: 1000 });

    throttledFunction();
    throttledFunction();

    clock.tick(1001);

    throttledFunction();
    throttledFunction();
    throttledFunction();

    clock.tick(1001);

    throttledFunction();
  });

  it('the throttled function was called three times', function() {
    expect(throttledStub).to.have.been.calledThrice;
  });

  after(function() {
    clock.restore();
  });
});
