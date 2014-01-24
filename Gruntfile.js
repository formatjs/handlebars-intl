module.exports = function (grunt) {

    var libpath = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['index.js', 'lib/*.js', 'tests/*.js']
        },
        uglify: {
            options: {
                preserveComments: 'some'
            },
            helpers: {
                src: 'lib/helpers.js',
                dest: 'build/helpers.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['uglify:helpers',]);
    grunt.registerTask('default', ['jshint']);
};
