module.exports = function(grunt) {
    grunt.initConfig({
        uglify: {
            options: {
                mangle: true,
                compress: true
            },
            jshtml: {
                files: {
                    'dist/jshtml.min.js': ['dist/jshtml.js']
                }
            }
        },
        concat: {
            options: {
                stripBanners: true
            },
            jshtml: {
                src: ['node_modules/js-html-compiler/lib/index.js', 'jshtml.js'],
                dest: 'dist/jshtml.js',
            }
        }
    });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat', 'uglify']);

};