const gulp = require("gulp");
const watch = require('gulp-watch');
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const csscomb = require('gulp-csscomb');
const notifier = require('node-notifier');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-clean-css');

const errorHandler = function(error) {
    notifier.notify({
      title: 'コンパイル失敗',
      message: 'Sassのコンパイルでエラーが発生しました。',
      sound: 'Glass'
    }, function () {
      console.log(error.message);
    });
  };

const success = function(success) {
  notifier.notify({
    title: 'コンパイル完了',
    message: 'Sassをコンパイルしました。',
    sound: 'Funk'
  }, function () {
    console.log(success.message);
  });
};


const watch_task = (task_name) => {
  return (event) => {
    gulp.start(task_name)
  }
}

gulp.task("sass", function() {
  return gulp.src("./src/sass/style.scss")
    .pipe(sassGlob())
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(sass())
    .pipe(csscomb())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task("watch", ['sass'], function() {
  watch('.src/sass/**/*.scss', watch_task('sass'));
});

gulp.task('default', ['watch']);
gulp.task('build', ['sass']);
