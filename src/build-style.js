var merge = require('ramda/src/merge');
var pick = require('ramda/src/pick');
var styles = require('./styles');

module.exports = function buildStyle(extendedStyle, styleNames) {
  var styleNamesWithDefault = ['otDefaults'].concat(styleNames || []);
  var stylesWithDefault = pick(styles, styleNamesWithDefault);
  return merge(stylesWithDefault, extendedStyle || {});
}
