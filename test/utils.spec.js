var utils = require(__BASE + '/src/utils');
var helper = require('./helper');
var settings = require(__BASE + '/src/settings');

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

    describe('december 2015', function() {
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
        expect(isDisabled.slice(0, 2)).to.all.equal(true);
      });

      it('disables days from december before the current date', function() {
        expect(isDisabled.slice(2, currentDay + 1)).to.all.equal(true);
      });

      it('enables days from december on or after the current date', function() {
        expect(isDisabled.slice(currentDay + 2,  33)).to.all.equal(false);
      });

      it('disables days from the next month', function() {
        expect(isDisabled.slice(33, 42)).to.all.equal(true);
      });
    });

    describe('november 2015', function() {
      var november2015 = utils.generateMonthFactory(6, 10, 2015)(10, 2015);

      it('starts with november first', function() {
        expect(november2015.displayedDays[0].dayOfMonth).to.equal(1);
      });
    });
  });
});
