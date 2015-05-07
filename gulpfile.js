var gulp = require("gulp");
var concat = require('gulp-concat');
var del = require('del');
var uglify = require('gulp-uglify');
var version = require("gulp-version-number");
var pkg = require("./package.json");

var srcFiles = [
		"./src/**/*.js"
	];

var destination = "./build";

gulp.task("default", function(){
	var versionString = pkg.version + "-dev-snapshot";
	var outputName = "xml3d.tools." + versionString + ".js";
	var versionConfig = {
		"value" : versionString,
		"replaces" : ["%VERSION%"]
	};

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(version(versionConfig))
			.pipe(gulp.dest(destination));
});

gulp.task("release", function(){
	var versionString = pkg.version;
	var outputName = "xml3d.tools." + versionString + ".min.js";
	var versionConfig = {
		"value" : versionString,
		"replaces" : ["%VERSION%"]
	};

	gulp.src(srcFiles)
			.pipe(concat(outputName))
			.pipe(version(versionConfig))
			.pipe(uglify())
			.pipe(gulp.dest(destination));
});

gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['build/*'], cb);
});
