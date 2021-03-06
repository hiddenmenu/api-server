'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';

import babel from 'gulp-babel';
import nodemon from 'gulp-nodemon';
import Cache from 'gulp-file-cache';
import del from 'del';


let cache = new Cache();

const SRC = {
    SERVER: 'server/**/*.js'
};

const DEST = {
    SERVER: 'app'
};
//
gulp.task('clean', () => {
    return del.sync([DEST.SERVER]);
});


gulp.task('babel', () => {
    return gulp.src(SRC.SERVER)
        .pipe(cache.filter())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(cache.cache())
        .pipe(gulp.dest(DEST.SERVER));
});

gulp.task('watch', () => {
    let watcher = {
        babel: gulp.watch(SRC.SERVER, ['babel'])
    };

    let notify = (event) => {
        gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
    };

    for(let key in watcher) {
        watcher[key].on('change', notify);
    }
});

gulp.task('production', ['babel']);

gulp.task('development', ['watch', 'babel'], () => {
    process.env.NODE_ENV = 'development';
    return nodemon({
        script: DEST.SERVER + '/main.js',
        watch: DEST.SERVER
    });
});

