module.exports = function(grunt) {

    grunt.initConfig({
        bower: grunt.file.readJSON('bower.json'),
        clean: {
            dist: ['dist/*'],
            html: ['html/*.html'],
            tmp : ['.tmp']
        },
        copy: {
            libs:{
                files: '<%= bower.copy %>'
            },
            dist: {
                files: [
                    {expand: true, cwd: 'scripts/', src: '**', dest: 'dist/scripts/'},
                    {expand: true, cwd: 'html/', src: '**', dest: 'dist/html/'},
                    {expand: true, cwd: 'assets/', src: ['**', '!**/scss/**'], dest: 'dist/assets/'},
                    {expand: true, cwd: 'libs/', src: '**', dest: 'dist/libs/'},
                    {src: 'index.html', dest: 'dist/index.html'},
                    {src: 'VERSION', dest: 'dist/VERSION'}
                ]
            }
        },
        htmlmin: {
            dist: {
                options: { removeComments: true, collapseWhitespace: true },
                files: [
                    { expand: true, cwd: 'views/', src: ['*.html', '**/*.html'], dest: 'dist/views/' }
                ]
            }
        },
        watch: {
            sass: {
              files: ['assets/scss/*.scss'],
              tasks: ['sass'],
            }
        },
        sass: {
            dist: {
                files: [
                    {'assets/styles/app.css': ['assets/scss/app.scss']},
                    {'assets/styles/app.rtl.css': ['assets/scss/app.rtl.scss']},
                    {'assets/bootstrap-rtl/dist/bootstrap-rtl.css': ['assets/bootstrap-rtl/scss/bootstrap-rtl.scss']}
                ]
            }
        },
        useminPrepare: {
            html: ['index.html']
        },
        usemin: {
            // html: ['dist/index.html'],
            js: ['dist/scripts/nh_app.an*.js'],
            css: ['dist/assets/styles/app.m*.css'],
            html: ['dist/*.html', 'dist/views/**/*.html'],
            options: {
                assetsDirs: ['dist', 'dist/assets/styles'],
                patterns: {
                  js: [
                    [/((scripts\/[\S][^,]+\.js)|(libs\/js\/echarts\/[\S][^,]+\.js))/gm, 'Replacing js']
                  ],
                  css: [
                    [/(\.\.\/images\/[\S]+\.(png|jpg|jpeg|gif|webp|svg))/gm, 'Replacing css']
                  ]
                }
            }
        },
        uglify: {
            dist: {
                files: [
                    {expand: true, cwd: 'dist/scripts/', src: ['*.js', '**/*.js'], dest: 'dist/scripts/'}
                ]
            }
        },
        filerev: {
            dist: {
                src: [
                    'dist/scripts/**/*.js', 
                    'dist/libs/js/echarts/**/*.js',
                    'dist/assets/styles/app.min.css',
                    'dist/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        bump: {
            options: {
                files: ['package.json'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },
        assemble: {
          options: {
            layoutdir: 'html/layout/',
            data: ['html/scripts/data.json'],
            flatten: true
          },
          page: {
            options: {
              layout: 'layout.html'
            },
            src: [
                'views/**/*.html',
                '!views/blocks/**',
                '!views/layout/**',
                '!views/misc/**',
                '!views/**/ng.*.html',
                '!views/**/tpl.*.html',
            ],
            dest: 'html/'
          },
          layout0: {
            options: {
              layout: 'layout.0.html'
            },
            src: [
                'views/dashboard/dashboard.0.html',
            ],
            dest: 'html/'
          },
          layout1: {
            options: {
              layout: 'layout.1.html'
            },
            src: [
                'views/dashboard/dashboard.1.html',
            ],
            dest: 'html/'
          },
          layout2: {
            options: {
              layout: 'layout.2.html'
            },
            src: [
                'views/dashboard/dashboard.2.html',
            ],
            dest: 'html/'
          },
          layout3: {
            options: {
              layout: 'layout.3.html'
            },
            src: [
                'views/dashboard/dashboard.3.html',
            ],
            dest: 'html/'
          },
          layout4: {
            options: {
              layout: 'layout.4.html'
            },
            src: [
                'views/dashboard/dashboard.4.html',
            ],
            dest: 'html/'
          },
          misc: {
            options: {
              layout: 'base.html'
            },
            src: [
                'views/misc/*.html'
            ],
            dest: 'html/'
          }
        }
    });

    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    //grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-assemble');
    grunt.loadNpmTasks('grunt-filerev');

    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        // 'useminPrepare',
        // 'concat:generated',
        // 'cssmin:generated',
        // 'uglify:generated',
        // 'usemin',
        'htmlmin',
        'clean:tmp'
    ]);

    grunt.registerTask('release', [
        // 'bump'
        'clean:dist',
        'copy',
        'htmlmin',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'uglify:dist',
        'filerev',
        'usemin',
        // 'htmlmin',
        'clean:tmp'
    ]);

    grunt.registerTask('html', [
        'clean:html',
        'assemble'
    ]);
};
