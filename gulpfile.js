global.__BASE = __dirname;

var gulp = require('gulp');
var R = require('ramda');
var taskFiles = require('./gulp/tasks');

R.mapObjIndexed(function(taskFile, taskFileName) {
  R.mapObjIndexed(function(taskValues, taskKey) {
    var taskName = taskFileName + ':' + taskKey;
    var dependencies = taskValues.dependencies || [];

    gulp.task(taskName, dependencies, function(cb) { return taskValues.task(cb, gulp); });
  }, taskFile);
}, taskFiles);

gulp.task('default', ['bundle:watch', 'connect:start']);
