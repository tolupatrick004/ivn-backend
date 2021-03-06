const gulp = require('gulp')
const babel = require('gulp-babel')

const babelrc = babel({
  'presets': [
    'env',
    'es2015',
    'es2016',
    'es2017'
  ],
  'plugins': [
    [
      'module-resolver',
      {
        'root': ['./'],
        'alias': {
          '@user': './src/services/user',
          '@party': './src/services/party',
          '@question': './src/services/question',
          '@answer': './src/services/answer',
          '@comment': './src/services/comment',
          '$routes': './src/routes',
          '$util': './src/util',
          'lib': './lib',
          '_middlewares': './src/middlewares',
          '_models': './src/models'
        }
      }
    ],
    'transform-class-properties',
    'transform-object-rest-spread'
  ]
})

gulp.task('build-src', () =>
  gulp.src('src/**/*.js')
    .pipe(babelrc)
    .pipe(gulp.dest('dist/src'))
)

gulp.task('build-lib', () =>
  gulp.src('lib/**/*.js')
    .pipe(babelrc)
    // .pipe(babel({
    //   presets: ['env']
    // }))
    .pipe(gulp.dest('dist/lib')))

gulp.task('build-knex', () =>
  gulp.src('knexfile.js')
    // .pipe(babel({
    //   presets: ['env']
    // }))
    .pipe(babelrc)
    .pipe(gulp.dest('dist/')))

gulp.task('default', ['build-src', 'build-lib'])
