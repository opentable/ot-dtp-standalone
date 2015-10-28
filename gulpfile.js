global.__BASE = __dirname;

var gulp = require('gulp');
var _ = require('lodash');
var taskFiles = require('./gulp/tasks');

_.each(taskFiles, function(taskFile, taskFileName) {
  _.each(taskFile, function(taskValues, taskKey) {
    var taskName = taskFileName + ':' + taskKey;
    var dependencies = taskValues.dependencies || [];

    gulp.task(taskName, dependencies, function(cb) { return taskValues.task(cb, gulp); });
  });
});
