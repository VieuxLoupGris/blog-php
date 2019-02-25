const gulp = require('gulp');
const sass = require('gulp-sass');
const {exec, spawn} = require('child_process');

var phpServ;
var composeUp;

function dev(callback){
  gulp.watch(['dist/scss/*.scss'], {ignoreInitial: false}, buildSass);

  let processCount = 0;
  composeUp = spawn('docker-compose', ['up'], {detached: true, stdio: ['ignore', 'inherit', 'inherit']});
  processCount++;
  composeUp.on('exit', () => processCount = exitIfClean(processCount, callback));

  phpServ = spawn('php', ['-S', 'localhost:8080', '-t', 'app/public'], {detached: true, stdio: ['ignore', 'inherit', 'inherit']});
  processCount++;
  phpServ.on('exit', () => processCount = exitIfClean(processCount, callback));
}

function buildSass() {
  return gulp.src(['dist/scss/*.scss','node_modules/bootstrap/scss/bootstrap.scss'])
    .pipe(sass())
    .pipe(gulp.dest('app/public/css'));
}

function exitIfClean(processCount, callback){
  processCount--;
  if(processCount == 0){
    callback();
    process.exit();
  }
  return processCount;
}

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, cleaning up...');
  composeUp.kill('SIGINT');
  phpServ.kill('SIGINT');
});

exports.default = dev;
exports.sass = buildSass;
