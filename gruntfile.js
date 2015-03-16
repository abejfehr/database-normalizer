module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      prod: {
        src: [
          'dev/*.js'
       ]
      }
    },
    concat: {
      jsprod: {
        src: [
          'dev/classes/Array.js',
          'dev/classes/DependencySet.js',
          'dev/classes/FunctionalDependency.js',
          'dev/classes/Relation.js',
          'dev/parseInput.js',
          'dev/controllers/appController.js'
        ],
        dest: 'prod/script.js'
      },
      cssprod: {
        src: [
          'dev/**/*.css'
        ],
        dest: 'prod/style.css'
      }
    },
    uglify: {
      jsprod: {
        src: 'prod/script.js',
        dest: 'prod/script.min.js'
      }
    },
    jasmine: {
      all: {
        src: 'prod/script.js',
        options: {
          specs: 'spec/*Spec.js',
          helpers: 'spec/*Helper.js'
        }
      }

    },
    watch: {
      scripts: {
        files: ['dev/*.js'],
        tasks: ['jshint', 'concat', 'uglify'],
        options: {
          spawn: false,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('default', ['jshint','concat','uglify', 'jasmine', 'watch']);
};
