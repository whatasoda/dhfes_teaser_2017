const gulp = require("gulp");
const watch = require('gulp-watch');
const sass = require("gulp-sass");
const sassGlob = require("gulp-sass-glob");
const csscomb = require('gulp-csscomb');
const cleanCSS = require('gulp-clean-css');


const watch_task = (task_name) => {
  return (event) => {
    gulp.start(task_name)
  }
}

gulp.task("sass", function() {
  return gulp.src("./src/sass/style.scss")
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(csscomb())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task("watch", ['sass'], function() {
  watch('./sass/**/*.scss', watch_task('sass'));
});

gulp.task('default', ['watch']);
gulp.task('build', ['sass']);
