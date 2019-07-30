const path = require('path')
const nodeSass = require('node-sass')
const envify = require('envify/custom')

module.exports = function (grunt) {
  const env = {
    dev: {
      GOOGLE_ANALYTICS_ID: 'UA-142639139-4',
      NODE_ENV: 'development'
    }
  }

  const sass = {
    dev: {
      options: {
        implementation: nodeSass,
        style: 'expanded',
        sourcemap: true,
        includePaths: [
          'node_modules'
        ],
        outputStyle: 'expanded'
      },
      files: [{
        expand: true,
        cwd: 'common/assets/sass',
        src: ['*.scss', 'custom/*.scss', 'components/*.scss'],
        dest: 'public/stylesheets/',
        ext: '.css'
      }]
    }
  }

  const copy = {
    commonAssets: {
      files: [
        {
          expand: true,
          cwd: 'common/assets/',
          src: ['**/*', '!sass/**', '!javascripts/**'],
          dest: 'public/'
        }
      ]
    },
    appAssets: {
      files: [
        {
          expand: true,
          cwd: 'app/assets/',
          src: ['**/*', '!sass/**', '!javascripts/**'],
          dest: 'public/'
        }
      ]
    }
  }

  const postcss = {
    prefix: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')()
        ]
      },
      src: 'public/stylesheets/application.css'
    }
  }

  const cssmin = {
    target: {
      files: {
        'public/stylesheets/application.min.css': [
          'public/stylesheets/application.css'
        ]
      }
    }
  }

  const watch = {
    css: {
      files: [
        'app/assets/sass/**/*.scss',
        'common/assets/sass/**/*.scss'
      ],
      tasks: ['sass', 'postcss:prefix', 'cssmin'],
      options: {
        spawn: false,
        livereload: true
      }
    },
    js: {
      files: [
        'app/assets/javascripts/**/*.{js,vue}',
        'app/lib/**/*.js',
        'common/browsered/index.js',
        'common/assets/javascripts/**/*.js'
      ],
      tasks: ['browserify', 'babel', 'concat', 'compress'],
      options: {
        spawn: false,
        livereload: true
      }
    },
    njk: {
      files: [
        'app/views/**/*.njk'
      ],
      options: {
        spawn: false,
        livereload: true
      }
    },
    assets: {
      files: ['common/assets/**/*', '!common/assets/sass/**', '!common/assets/javascripts/**'],
      tasks: ['copy:assets', 'compress'],
      options: {
        spawn: false
      }
    }
  }

  const browserify = {
    'public/javascripts/browsered.js': ['common/browsered/index.js'],
    options: {
      browserifyOptions: {
        standalone: 'module'
      },
      // Function to deviate from grunt-browserify's default order
      configure: function (bundle) {
        return bundle.transform('vueify')
          .transform(
            // Required in order to process node_modules files
            { global: true },
            envify({ NODE_ENV: process.env.NODE_ENV })
          )
          .bundle()
      }
    }
  }

  const babel = {
    options: {
      presets: ['@babel/preset-env']
    },
    dist: {
      files: {
        'public/javascripts/browsered.js': 'public/javascripts/browsered.js'
      }
    }
  }

  const nodemon = {
    dev: {
      script: 'server.js',
      options: {
        ext: 'js',
        ignore: ['node_modules/**', 'common/assets/**', 'public/**'],
        args: ['-i=true']
      }
    }
  }

  const concurrent = {
    target: {
      tasks: ['watch', 'nodemon'],
      options: {
        logConcurrentOutput: true
      }
    }
  }

  const concat = {
    options: {
      separator: ';'
    },
    dist: {
      src: [
        'public/javascripts/browsered.js',
        'common/assets/javascripts/**/*.js'
      ],
      dest: 'public/javascripts/application.js'
    }
  }

  const rewrite = {
    'application.min.css': {
      src: 'public/stylesheets/application.min.css',
      editor (contents) {
        const staticify = require('staticify')(path.join(__dirname, 'public'))
        return staticify.replacePaths(contents)
      }
    }
  }

  const compress = {
    main: {
      options: {
        mode: 'gzip'
      },
      files: [
        { expand: true, src: ['public/images/*.jpg'], ext: '.jpg.gz' },
        { expand: true, src: ['public/images/*.gif'], ext: '.gif.gz' },
        { expand: true, src: ['public/images/*.png'], ext: '.png.gz' },
        { expand: true, src: ['public/javascripts/*.js'], ext: '.js.gz' },
        { expand: true, src: ['public/stylesheets/*.css'], ext: '.css.gz' }
      ]
    }
  }

  grunt.initConfig({
    env,
    clean: ['public', 'govuk_modules'],
    copy,
    sass,
    watch,
    browserify,
    babel,
    nodemon,
    concurrent,
    postcss,
    cssmin,
    concat,
    rewrite,
    compress
  });

  [
    'grunt-env',
    'grunt-contrib-copy',
    'grunt-contrib-cssmin',
    'grunt-contrib-compress',
    'grunt-contrib-watch',
    'grunt-contrib-clean',
    'grunt-sass',
    'grunt-nodemon',
    'grunt-concurrent',
    'grunt-browserify',
    'grunt-contrib-concat',
    'grunt-rewrite',
    'grunt-babel',
    'grunt-postcss'
  ].forEach(task => {
    grunt.loadNpmTasks(task)
  })

  grunt.registerTask('generate-assets', [
    'env:dev',
    'clean',
    'copy',
    'sass',
    'browserify',
    'babel',
    'concat',
    'rewrite',
    'compress',
    'postcss',
    'cssmin'
  ])

  grunt.registerTask('default', ['generate-assets', 'concurrent:target'])
}
