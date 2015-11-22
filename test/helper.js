var chai = require('chai');
var joi = require('joi');
var chaiJoi = require('chai-joi');
var chaiThings = require('chai-things');
var sinonChai = require('sinon-chai');

chai.use(chaiJoi);
chai.use(chaiThings);
chai.use(sinonChai);

module.exports = {
  chai: chai,
  expect: chai.expect,
  joi: joi
};
