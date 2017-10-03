const gulp = require("gulp");
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const csscomb = require('gulp-csscomb');
const notifier = require('node-notifier');
const plumber = require('gulp-plumber');

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

gulp.task("sass", function() {
  return gulp.src("./sass/style.scss")
    .pipe(sassGlob())
    .pipe(plumber({errorHandler: errorHandler}))
    .pipe(sass())
    .pipe(gulp.dest("./css"));
});

gulp.task('csscomb', ['sass'], function() {
  return gulp.src('css')
    .pipe(csscomb())
    .pipe(gulp.dest('./'));
});

gulp.task("watch", ['csscomb'], function() {
  gulp.watch('./sass/**/*.scss', ['csscomb']);
});

gulp.task('default', ['watch']);
