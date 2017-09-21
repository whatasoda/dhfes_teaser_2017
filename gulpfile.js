const gulp = require("gulp");
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const csscomb = require('gulp-csscomb');

gulp.task("sass", function() {
  return gulp.src("./sass/style.scss")
    .pipe(sassGlob())
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
