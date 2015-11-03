var merge = require('ramda/src/merge');
var pick = require('ramda/src/pick');
var values = require('ramda/src/values');
var reduce = require('ramda/src/reduce');
var styles = require('./styles');

module.exports = function buildStyle(extendedStyle, styleNames) {
  var styleNamesWithDefault = ['otDefaults'].concat(styleNames || []);
  var stylesWithDefault = values(pick(styleNamesWithDefault, styles));
  var stylesWithExtended = stylesWithDefault.concat([extendedStyle || {}]);
  return reduce(merge, {}, stylesWithExtended);
}
