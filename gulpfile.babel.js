import gulp from "gulp";
import gulpPug from "gulp-pug";
import del from "delete";
import ws from "gulp-webserver";
import gimage from "gulp-image";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autop from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages";

const sass = gulpSass(dartSass);

const routes = {
  pug: {
    src: "src/*.pug",
    dest: "build",
    watch: "src/**/*.pug",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
};

const pug = () => {
  return gulp
    .src(routes.pug.src)
    .pipe(gulpPug())
    .pipe(gulp.dest(routes.pug.dest));
};

const clean = () => {
  return del(["build"]);
};

const webserver = () => {
  return gulp.src("build").pipe(ws({ livereload: true, open: true }));
};

const img = () => {
  return gulp
    .src(routes.img.src)
    .pipe(gimage())
    .pipe(gulp.dest(routes.img.dest));
};

const styles = () => {
  return gulp
    .src(routes.scss.src, { allowEmpty: true })
    .pipe(sass().on("error", sass.logError))
    .pipe(autop())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));
};

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const ghdeploy = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series(clean, img);

const assets = gulp.series(pug, styles, js);

const postDev = gulp.parallel(webserver, watch);

export const build = gulp.series(prepare, assets);
export const dev = gulp.series(build, postDev);
export const deploy = gulp.series(build, ghdeploy);
