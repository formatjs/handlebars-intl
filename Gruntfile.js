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
            index: {
                src: 'index.js',
                dest: 'build/index.min.js'
            }
        }
    });

    grunt.loadTasks('./tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['uglify:index',]);
    grunt.registerTask('default', ['jshint']);
};
