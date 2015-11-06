var chai = require('chai');
var joi = require('joi');
var chaiJoi = require('chai-joi');

chai.use(chaiJoi);

module.exports = {
  chai: chai,
  expect: chai.expect,
  joi: joi
};
