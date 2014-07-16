module.exports = function (grunt) {

    var libpath = require('path');

    grunt.initConfig({
        "pkg": grunt.file.readJSON('package.json'),
        "jshint": {
            "all": ['src/*.js', 'tests/*.js']
        },
        "compile-modules": {
            "src": 'src/umd.js',
            "dest": 'dist/helpers.js'
        },
        "uglify": {
            "options": {
                "preserveComments": 'some'
            },
            "all": {
                "expand": true,
                "flatten": true,
                "src": ['dist/*.js', '!dist/*.min.js'],
                "dest": 'dist',
                "rename": function(dest, src) {
                    var ext = libpath.extname(src),
                        base = libpath.basename(src, ext);
                    return libpath.resolve(dest, base + '.min' + ext);
                }
            }
        }
    });

    grunt.loadTasks('./tasks');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('build', ['compile-modules', 'uglify:all']);
    grunt.registerTask('default', ['jshint']);
};
