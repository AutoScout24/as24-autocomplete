const gulp = require('gulp');
const cbngulp = require('carbon-gulp')(gulp);

cbngulp.config.devmode = true;

cbngulp.registerTasks({
    js: {
        entry: './src/as24-autocomplete.js',
        out: './dist/as24-autocomplete.js',
        watch: './src/**.js'
    },
    'js:docs': {
        type: 'js',
        entry: './src/as24-autocomplete.js',
        out: './docs/as24-autocomplete.js',
        watch: './src/**.js'
    },
    scss: {
        entry: './src/as24-autocomplete.scss',
        out: './dist/as24-autocomplete.css',
        watch: './src/**.js'
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

gulp.task('default', ['scss', 'js']);
gulp.task('dev', ['serve', 'js:docs:watch', 'scss:docs:watch', 'js', 'scss']);
