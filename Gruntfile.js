'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: 'dist/',
            lib : 'lib/',
            tmp : 'tmp/'
        },

        copy: {
            tmp: {
                expand : true,
                flatten: true,
                src    : ['tmp/src/*.js'],
                dest   : 'lib/'
            }
        },

        jshint: {
            all: ['src/*.js', 'tests/*.js']
        },

        benchmark: {
            all: {
                src: ['tests/benchmark/*.js']
            }
        },

        bundle_jsnext: {
            dest: 'dist/helpers.js',

            options: {
                namespace: 'HandlebarsIntl'
            }
        },

        cjs_jsnext: {
            dest: 'tmp/'
        },

        uglify: {
            all: {
                src: 'dist/helpers.js',
                dest: 'dist/helpers.min.js',

                options: {
                    preserveComments: 'some'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-benchmark');
    grunt.loadNpmTasks('grunt-bundle-jsnext-lib');

    grunt.registerTask('default', [
        'jshint', 'clean', 'bundle_jsnext', 'uglify', 'cjs_jsnext', 'copy'
    ]);
};
