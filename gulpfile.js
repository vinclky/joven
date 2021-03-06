/**
 * Jaziel's Gulp Automation
 * Joven Website
 */

// var gulpAutoprefixer = require("gulp-autoprefixer");
var autoprefixer = require("autoprefixer");
var browserSync = require("browser-sync").create();
// var csscomb = require("gulp-csscomb");
var cleanCss = require("gulp-clean-css");
// var cache = require('gulp-cache');
// var cssnano = require('gulp-cssnano');
var del = require("del");
// var imagemin = require('gulp-imagemin');
// var htmlPrettify = require('gulp-html-prettify');
var gulp = require("gulp");
// var gulpIf = require('gulp-if');
// var gulpRun = require('gulp-run');
// var npmDist = require('gulp-npm-dist');
var postcss = require("gulp-postcss");
var runSequence = require("run-sequence");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var postcssFlexBug = require("postcss-flexbugs-fixes");
// var useref = require('gulp-useref-plus');
// var wait = require("gulp-wait");

// Define paths

var paths = {
  dist: {
    base: "dist",
    img: "dist/assets/img",
    libs: "dist/assets/vendor"
  },
  base: {
    base: "./",
    node: "node_modules"
  },
  src: {
    base: "./",
    css: "assets/css",
    maps: "map",
    html: "**/*.html",
    img: "assets/img/**/*.+(png|jpg|gif|svg)",
    js: "assets/js/**/*.js",
    scss: "assets/scss/**/*.scss"
  }
};

// Compile SCSS
gulp.task("scss", function() {
  return (
    gulp
      .src(paths.src.scss)
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))
      // .pipe(postcss([require(postcssFlexBug)]))
      .pipe(postcss([autoprefixer({ browsers: ["> 1%"] })]))
      // .pipe(csscomb())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(paths.src.css))
      .pipe(
        browserSync.reload({
          stream: true
        })
      )
  );
});

// Minify CSS
gulp.task("minify:css", function() {
  return gulp
    .src([paths.src.css + "/theme.css"])
    .pipe(cleanCss())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.dist.base + "/assets/css"));
});

// Minify JS
gulp.task("minify:js", function(cb) {
  return gulp
    .src([paths.src.base + "/assets/js/theme.js"])
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.dist.base + "/assets/js"));
});

//generate sourcemaps JS
gulp.task("sourcemap:js", function() {
  return gulp
    .src([paths.src.base + "/assets/js/theme.js"])
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.src.js))
    .pipe(
      browserSync.reload({
        stream: true
      })
    );
});

// Live reload
gulp.task("browserSync", function() {
  browserSync.init({
    server: {
      baseDir: [paths.src.base, paths.base.base]
    }
  });
});

// Watch for changes
gulp.task("watch", ["browserSync", "scss"], function() {
  gulp.watch(paths.src.scss, ["scss"]);
  gulp.watch(paths.src.js, browserSync.reload);
  gulp.watch(paths.src.html, browserSync.reload);
});

// Clean
gulp.task("clean:dist", function() {
  return del.sync(paths.dist.base);
});

// Copy CSS
gulp.task("copy:css", function() {
  return gulp
    .src([paths.src.base + "/assets/css/theme.css"])
    .pipe(gulp.dest(paths.dist.base + "/assets/css"));
});

// Copy JS
gulp.task("copy:js", function() {
  return gulp
    .src([paths.src.base + "/assets/js/theme.js"])
    .pipe(gulp.dest(paths.dist.base + "/assets/js"));
});

//Copy all images and directories
gulp.task("copy:img", function() {
  return gulp
    .src([paths.src.base + "/assets/img/**/*"])
    .pipe(gulp.dest(paths.dist.base + "/assets/img/"));
});

// copy all used html
gulp.task("copy:html", function() {
  return gulp.src([paths.src.base + "*.html"]).pipe(gulp.dest(paths.dist.base));
});

// Build
gulp.task("build", function(callback) {
  runSequence(
    "clean:dist",
    "scss",
    "copy:css",
    "copy:js",
    "copy:img",
    "copy:html",
    "minify:js",
    "minify:css",
    callback
  );
});

// Default
gulp.task("default", function(callback) {
  runSequence(["scss", "browserSync", "watch"], callback);
});
