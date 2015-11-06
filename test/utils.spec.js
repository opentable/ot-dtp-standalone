var utils = require(__BASE + '/src/utils');
var helper = require('./helper');
var settings = require(__BASE + '/src/settings');
var R = require('ramda');

var expect = helper.expect;
var joi = helper.joi;

describe('utils', function() {
  describe('generateMonthFactory', function() {
    var monthSchema = joi.object({
      name: joi.string(),
      displayedDays: joi.array().items(joi.object({
        dayOfMonth: joi.number(),
        isDisabled: joi.boolean()
      }))
    });

    var currentDay = 5;
    var december2015 = utils.generateMonthFactory(currentDay, 11, 2015)(11, 2015);

    var isDisabled = december2015.displayedDays.map(function(day) {
      return day.isDisabled;
    });

    it('generates correctly formatted output', function() {
      expect(joi.validate(december2015, monthSchema)).to.validate;
    });

    it('the calendar displays the right number of days', function() {
      expect(december2015.displayedDays).to.have.length(42);
    });

    it('disables days from the previous month', function() {
      expect(R.all(R.identity, isDisabled.slice(0, 2))).to.be.true;
    });

    it('disables days from december before the current date', function() {
      expect(R.all(R.identity, isDisabled.slice(2, currentDay + 1))).to.be.true;
    });

    it('enables days from december on or after the current date', function() {
      expect(R.all(R.not, isDisabled.slice(currentDay + 2,  33))).to.be.true;
    });

    it('disables days from the next month', function() {
      expect(R.all(R.identity, isDisabled.slice(33, 42))).to.be.true;
    });
  });
});
