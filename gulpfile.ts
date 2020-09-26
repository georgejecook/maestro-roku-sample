import { series } from "gulp";
import { ProgramBuilder } from 'brighterscript';

const fs = require('fs-extra');
const path = require('path');
const gulp = require('gulp');
const gulpClean = require('gulp-clean');
const outDir = './build';
const cp = require('child_process');
const pkg = require('./package.json');
const zip = require('gulp-zip');

export function clean() {
  console.log('Doing a clean at ' + outDir);
  return gulp.src(['out',
    'dist',
  ], { allowEmpty: true }).pipe(gulpClean({ force: true }));
}

export function createDirectories() {
  return gulp.src('*.*', { read: false })
    .pipe(gulp.dest('./dist'));
}

export function doc(cb) {
  let task = cp.exec('./node_modules/.bin/jsdoc -c jsdoc.json -t node_modules/minami -d docs');
  return task;
}

export async function compile(cb) {
  // copy all sources to tmp folder
  // so we can add the line numbers to them prior to transpiling
  let builder = new ProgramBuilder();
  let config = require('./bsconfig.json');
  // await builder.run(config);
  await builder.run({});
  fs.removeSync(path.join('dist', 'manifest'));
  // this will move to a ropm module; until then we need our own bslib copies
  // fs.removeSync(path.join('dist', 'source', 'bslib.brs'));
}

export async function compileTests(cb) {
  // copy all sources to tmp folder
  // so we can add the line numbers to them prior to transpiling
  let builder = new ProgramBuilder();
  await builder.run({ "project": './tests/bsconfig.json' });
}

exports.dist = series(exports.compile, doc);
