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

// var gulp = require('gulp');
// var connect = require('gulp-connect');
// var util = require('gulp-util');

// function bundle(bundler) {
//   return bundler
//     .bundle()
//     .on('error', function handleError(e) {
//       err = _.escape(String(e));
//       if (socket) {
//         socket.emit('APP_UPDATE_ERROR', err);
//       }
//       util.log(err);
//       this.emit('end');
//     })
//     .on('end', function endBundle() {
//       if (socket && !err) {
//         let size = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
//         let data = Buffer.concat(chunks, size);
//         socket.emit('APP_UPDATE', data.toString());
//       }
//     })
//     .pipe(source(path.join(__dirname, '..', paths.src)))
//     .pipe(rename(`${bundleName}.${platform}.js`))
//     .pipe(gulp.dest(path.join(__dirname, '../../dist/js')));
// }
// import util from 'gulp-util';
// import gulp from 'gulp';
// import through from 'through';
// import _ from 'lodash';
// import path from 'path';
// import watchify from 'watchify';
// import browserify from 'browserify';
// import babelify from 'babelify';
// import rename from 'gulp-rename';
// import source from 'vinyl-source-stream';
// import envify from 'envify';
// import uglifyify from 'uglifyify';
// import merge from 'merge-stream';
// import devSocket from '../../dev-socket';

// /*eslint-disable*/
// import bufferConcat from 'buffer-concat';
// /*eslint-enable*/

// import {
//   browserifyOpts,
//   bundleName,
//   environmentMap,
//   paths
// } from '../../gulp-config';

// function bundle({bundler, socket, platform}) {
//   let chunks = [];
//   let err;

//   return bundler
//     .bundle()
//     .on('error', function handleError(e) {
//       err = _.escape(String(e));
//       if (socket) {
//         socket.emit('APP_UPDATE_ERROR', err);
//       }
//       util.log(err);
//       this.emit('end');
//     })
//     .on('end', function endBundle() {
//       if (socket && !err) {
//         let size = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
//         let data = Buffer.concat(chunks, size);
//         socket.emit('APP_UPDATE', data.toString());
//       }
//     })
//     .pipe(through(function write(data) {
//       if (socket) {
//         chunks.push(data);
//       }
//       this.emit('data', data);
//     }))
//     .pipe(source(path.join(__dirname, '..', paths.src)))
//     .pipe(rename(`${bundleName}.${platform}.js`))
//     .pipe(gulp.dest(path.join(__dirname, '../../dist/js')));
// }

// function buildWatcher({socket, platform}) {
//   let bOpts = {
//     cache: {},
//     packageCache: {},
//     debug: true,
//     standalone: browserifyOpts.standalone
//   };

//   let browserifier = browserify(path.join(__dirname, '..', '..', paths.src), bOpts)
//     .transform(babelify)
//     .transform(envify, {
//       NODE_ENV: 'development',
//       PLATFORM: platform,
//     });

//   let watchifier = watchify(browserifier, { delay: 10 })
//     .on('update', function updateBundle() {
//       util.log('Updating bundle...');
//       bundle({bundler: watchifier, socket, platform});
//     })
//     .on('log', function logUpdate(msg) {
//       util.log(msg);
//     });

//   return bundle({bundler: watchifier, platform});
// }

// function buildProductionBundler({platform}) {
//   let bOpts = {
//     standalone: browserifyOpts.standalone
//   };

//   let browserifier = browserify(path.join(__dirname, '..', '..', paths.src), bOpts)
//     .transform(babelify)
//     .transform(envify, {
//       NODE_ENV: 'production',
//       PLATFORM: platform,
//     })
//     .transform(uglifyify, {
//       compress: {
//         dead_code: true,
//         conditionals: true,
//         unused: true,
//         evaluate: true
//       }
//     });

//   return bundle({bundler: browserifier, platform});
// }

// export function watch(cb, gulp) {
//   let socket = devSocket.start();
//   let watchers = [
//     {socket, platform: 'client'},
//     {platform: 'server'}
//   ]
//   .map(buildWatcher);

//   return merge.apply(null, watchers);
// }
