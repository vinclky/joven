/**
 * Jaziel's Gulp Automation
 */

var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync").create();
var csscomb = require("gulp-csscomb");
var cleanCss = require("gulp-clean-css");
var cache = require("gulp-cache");
var cssnano = require("gulp-cssnano");
var del = require("del");
var imagemin = require("gulp-imagemin");
var htmlPrettify = require("gulp-html-prettify");
var gulp = require("gulp");
var gulpIf = require("gulp-if");
var gulpRun = require("gulp-run");
var concat = require("gulp-concat");
var npmDist = require("gulp-npm-dist");
var postcss = require("gulp-postcss");
var plumber = require("gulp-plumber");
var runSequence = require("run-sequence");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var replace = require("gulp-replace");
var saveLicense = require("uglify-save-license");
var useref = require("gulp-useref-plus");
var wait = require("gulp-wait");

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
    scss: "assets/scss/**/*.scss",
    vendor: "assets/vendor"
  }
};

// Bundle Js
gulp.task("bundle:js", function() {
  return gulp
    .src([
      "assets/vendor/jquery/dist/jquery.min.js",
      "assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js",
      "assets/vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js",
      "assets/vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.min.js",
      "assets/vendor/in-view/dist/in-view.min.js",
      "assets/vendor/autosize/dist/autosize.min.js",
      "assets/vendor/swiper/dist/js/swiper.min.js",
      "assets/vendor/select2/dist/js/select2.min.js",
      "assets/vendor/sticky-kit/dist/sticky-kit.min.js",
      "assets/js/theme.js"
    ])
    .pipe(concat("bundle.js"))
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.base + "/assets/js/"));
});

// Compile SCSS

gulp.task("scss", function() {
  return (
    gulp
      .src(paths.src.scss)
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: "compact" }).on("error", sass.logError))
      // .pipe(postcss([require("postcss-flexbugs-fixes")]))
      .pipe(
        autoprefixer({
          browsers: ["> 1%"]
        })
      )
      // .pipe(csscomb())
      .pipe(sourcemaps.write("maps"))
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
    .src(paths.src.css + "/theme.css")
    .pipe(sourcemaps.init())
    .pipe(cleanCss())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("maps"))
    .pipe(gulp.dest(paths.dist.base + "/assets/css"));
});

// Minify JS

gulp.task("minify:js", function(cb) {
  return gulp
    .src(paths.src.base + "/assets/js/theme.js")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    // .pipe(sourcemaps.write("maps")) Causing propblems????
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("maps"))
    .pipe(gulp.dest(paths.dist.base + "/assets/js"));
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
  // gulp.watch(paths.src.js, browserSync.reload);
  gulp.watch(paths.src.html, browserSync.reload);
});

// Clean

gulp.task("clean:dist", function() {
  return del.sync(paths.dist.base);
});


//Copy all images and directories

gulp.task("copy:img", function() {
  return gulp
    .src([paths.src.base + "assets/img/**/*"])
    .pipe(gulp.dest(paths.dist.base + "/assets/img/"));
});

// copy all used html

gulp.task("copy:html", function() {
  return gulp
  .src([paths.src.base + "*.html"])
  .pipe(gulp.dest(paths.dist.base));
});

gulp.task("copy:vendor", function () {
  return gulp
    .src([paths.src.base + "assets/vendor/**/*"])
    .pipe(gulp.dest(paths.dist.base + "/assets/vendor/"));
});


// Build

gulp.task("build", function(callback) {
  runSequence(
    "clean:dist",
    "scss",
    "minify:css",
    "bundle:js",
    "copy:img",
    "copy:html",
    "copy:vendor",
    callback
  );
});

// Default

gulp.task("default", function(callback) {
  runSequence(["scss", "browserSync", "watch"], callback);
});
