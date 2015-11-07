var chai = require('chai');
var joi = require('joi');
var chaiJoi = require('chai-joi');
var chaiThings = require('chai-things');

chai.use(chaiJoi);
chai.use(chaiThings);

module.exports = {
  chai: chai,
  expect: chai.expect,
  joi: joi
};
