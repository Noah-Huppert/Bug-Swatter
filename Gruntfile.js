module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      "curly": true,
      "eqnull": true,
      "eqeqeq": true,
      "undef": true,
      "globals": {
      "jQuery": true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('test', ['jshint']);

};