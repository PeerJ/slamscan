const gulp = require("gulp");

gulp.task("clean", function () {
    const vinylPaths = require("vinyl-paths");
    const del = require("del");
    const path = require("path");

    const directories = [".serverless/", ".webpack/", ".dynamodb/", "coverage/", ".nyc_output/", "build/"].map(directory => path.join(__dirname, directory));

    return gulp.src(directories, {allowEmpty: true})
        .pipe(vinylPaths(del));
});

function isFixed(file) {
    return file.eslint && file.eslint.fixed;
}

gulp.task("eslint", function () {
    const path = require("path");
    const eslint = require("gulp-eslint");
    const gulpIf = require("gulp-if");

    return gulp.src(["**/*.js"])
        .pipe(eslint({fix: true, ignorePath: path.join(__dirname, ".eslintignore")}))
        .pipe(eslint.format())
        .pipe(gulpIf(isFixed, gulp.dest("./")))
        .pipe(eslint.failAfterError());
});

gulp.task("lint", gulp.parallel(["eslint"]));

gulp.task("test.unit", () => {
    const mocha = require("gulp-mocha");
    const mochaConfig = require("./mocha.config");

    return gulp.src("test/unit/**/*.js", {read: false})
        .pipe(mocha(mochaConfig));
});

gulp.task("test.integration", () => {
    const mocha = require("gulp-mocha");
    const mochaConfig = require("./mocha.config");

    return gulp.src("test/integration/**/*.js", {read: false})
        .pipe(mocha(mochaConfig));
});

gulp.task("test", gulp.parallel(["test.unit", "test.integration"]));
