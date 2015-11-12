var merge = require('ramda/src/merge');

var defaults = {
  boxSizing: 'border-box',
  // fontFamily: '\"source-sans-pro\",\"Helvetica Neue\",Helvetica,Arial,sans-serif',
  fontFamily: '"Helvetica Neue Light", "HelveticaNeue-Light", "Helvetica Neue", Calibri, Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 400,
  margin: 0,
  padding: 0
};

module.exports = function buildStyle(style) {
  return merge(defaults, style);
}
