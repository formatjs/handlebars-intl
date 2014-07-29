module.exports = function (grunt) {

    var libpath = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['src/*.js', 'tests/*.js']
        },
        bundle_jsnext: {
            options: {
                namespace: 'HandlebarsHelperIntl'
            },
            dest: 'dist/helpers.js'
        },
        uglify: {
            options: {
                preserveComments: 'some'
            },
            dist: {
                src: ['dist/helpers.js'],
                dest: 'dist/helpers.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bundle-jsnext-lib');

    grunt.registerTask('build', ['bundle_jsnext', 'uglify:dist']);
    grunt.registerTask('default', ['jshint']);
};
