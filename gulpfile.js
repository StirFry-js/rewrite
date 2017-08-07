const gulp = require('gulp');
const ts = require('gulp-typescript');
const mocha = require('gulp-mocha');
const merge = require('merge2');
const spawn = require('child_process').spawn;
const tsProject = ts.createProject('tsconfig.json', {
	declaration: true
});


gulp.task('ts', function () {
	const tsResult = gulp.src('src/**/*.ts')
		.pipe(tsProject());

	return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
		tsResult.dts.pipe(gulp.dest('lib/')),
		tsResult.js.pipe(gulp.dest('lib/'))
	]);
});

gulp.task('test', ['ts'], function () {
	spawn('./node_modules/.bin/mocha', '--recursive test/ -r test/prefix.js'.split(/\s/g), {
		stdio: 'inherit'
	});
});

gulp.task('watch', ['test'], function () {
	gulp.watch(['src/**/*.ts', 'test/**/*.js', 'stirfry.js', 'tsconfig.json'], ['test']);
});

gulp.task('default', ['watch'], function () {

});