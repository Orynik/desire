import { src, dest, watch, parallel, series } from 'gulp';

import scss from 'gulp-sass';
import concat from 'gulp-concat';
const browserSync = require('browser-sync').create();
import uglify from 'gulp-uglify-es';
import autoprefixer from 'gulp-autoprefixer';
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import del from 'del';

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		}
	});
}

function cleanDist() {
	return del('dist');
}

function images() {
	return src('app/images/**/*')
		.pipe(imagemin(
			[
				gifsicle({ interlaced: true }),
				mozjpeg({ quality: 75, progressive: true }),
				optipng({ optimizationLevel: 5 }),
				svgo({
					plugins: [
						{ removeViewBox: true },
						{ cleanupIDs: false }
					]
				})
			]
		))
		.pipe(dest('dist/images'));
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.js',
		'app/js/main.js',
		'node_modules/slick-carousel/slick/slick.js'
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('app/js'))
		.pipe(browserSync.stream());
}


function styles() {
	return src('app/scss/style.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 version'],
			grid: true
		}))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream());
}

function build() {
	return src([
		'app/css/style.min.css',
		'app/fonts/**/*',
		'app/js/main.min.js',
		'app/*.html'
	], { base: 'app' })
		.pipe(dest('dist'));
}

function watching() {
	watch(['app/scss/**/*.scss'], styles);
	watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
	watch(['app/*.html']).on('change', browserSync.reload);
}

const _styles = styles;
export { _styles as styles };
const _watching = watching;
export { _watching as watching };
const _browsersync = browsersync;
export { _browsersync as browsersync };
const _scripts = scripts;
export { _scripts as scripts };
const _images = images;
export { _images as images };
const _cleanDist = cleanDist;
export { _cleanDist as cleanDist };


const _build = series(cleanDist, images, build);
export { _build as build };
const _default = parallel(styles, scripts, browsersync, watching);
export { _default as default };
