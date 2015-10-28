var connect = require('gulp-connect');
var path = require('path');

module.exports.start = {
  task: function() {
    connect.server({
      root: path.join(__BASE, 'lib'),
      livereload: true,
      fallback: 'index.html',
    });
  }
};
