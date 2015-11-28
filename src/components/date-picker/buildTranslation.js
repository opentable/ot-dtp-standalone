var translations = require('./translations');
var merge = require('ramda/src/merge');

module.exports = function buildTranslation(locale) {
  return merge(translations['en-US'], translations[locale] || {});
};
