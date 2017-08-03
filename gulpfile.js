const gulp = require('gulp');
const scGulp = require('showcar-gulp')(gulp);

scGulp.registerTasks({
    js: {
        entry: './src/as24-autocomplete.js',
        out: './dist/as24-autocomplete.js',
        watch: './src/**/*.js'
    },
    'js:docs': {
        type: 'js',
        entry: './src/as24-autocomplete.js',
        out: './docs/as24-autocomplete.js',
        watch: './src/**/*.js'
    },
    scss: {
        entry: './src/as24-autocomplete.scss',
        out: './dist/as24-autocomplete.css',
        watch: './src/**/*.scss'
    },
    'scss:docs': {
        type: 'scss',
        entry: './src/as24-autocomplete.scss',
        out: './docs/as24-autocomplete.css',
        watch: 'src/**/*.scss'
    },
    serve: {
        dir: './docs'
    }
});

gulp.task('ts', () => {
    gulp.src('./ts/as24-autocomplete.d.ts').pipe(gulp.dest('dist/'))
});

gulp.task('set-dev', () => {
    scGulp.config.devmode = true;
});

gulp.task('set-prod', () => {
    scGulp.config.devmode = false;
});

gulp.task('default', ['set-prod', 'scss', 'js', 'ts']);
gulp.task('dev', ['set-dev', 'js', 'scss', 'ts', 'serve', 'js:docs:watch', 'scss:docs:watch', ]);
