module.exports = function(grunt) {

	var env = loadEnv(); // eslint-disable-line no-unused-vars
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks('remap-istanbul');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		mochaTest: {
			unit: {
				options: {
					reporter: process.env.TEST_REPORT_JUNIT === '1' ? 'mocha-junit-reporter' : 'spec',
					reporterOptions: {
						mochaFile: './build/test-results.xml',
					},
				},
				src: ['build/dist/test/unit/**/*.js'],
			},

			integration: {
				options: {
					reporter: process.env.TEST_REPORT_JUNIT === '1' ? 'mocha-junit-reporter' : 'spec',
					reporterOptions: {
						mochaFile: './build/test-results-integration.xml',
					},
				},
				src: ['build/dist/test/integration/**/*.js'],
			},
		},

		exec: {
			cover: {
				cmd: './node_modules/.bin/istanbul cover grunt --root build/dist/src --include-all-sources --dir ./build/coverage --print both --report none -- test',
				stdout: false,
			},
			reportCoverage: {
				cmd: './node_modules/.bin/istanbul report html --root build/coverage --include coverage-mapped.json --dir ./build/coverage/report',
				stdout: false,
			},
		},

		remapIstanbul: {
			build: {
				src: './build/coverage/coverage.json',
				options: {
					reports: {
						'json': 'build/coverage/coverage-mapped.json',
					},
					basePath: './src',
				},
			},
		},

		clean: {
			all: {
				src: ['build'],
			},
		},

		jscs: {
			node: {
				src: ['src/**/*.js', 'test/**/*.js', 'Gruntfile.js'],
				options: {
					config: true,
					verbose: true,
				},
			},
		},

		eslint: {
			node: [
				'src',
				'test',
				'Gruntfile.js',
			],
		},

		express: {
			dev: {
				options: {
					script: 'app.js',
				},
			},
			server: {
				options: {
					script: 'app.js',
					background: false,
				},
			},
		},

		babel: {
			options: {
				sourceMap: 'inline',
			},
			src: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['**/*.js'],
					dest: 'build/dist/src',
					ext: '.js',
				}, {
					expand: true,
					cwd: 'test/',
					src: ['**/*.js'],
					dest: 'build/dist/test',
					ext: '.js',
				}],
			},
		},

		watch: {
			src: {
				files: ['src/server/**/*.js', 'test/**/*.js'],
				tasks: ['src', 'loadEnv', 'express:dev'],
				options: {
					atBegin: true,
					spawn: false,
				},
			},
		},

		esdoc: {
			dist: {
				options: {
					source: 'src',
					destination: 'build/doc',
					plugins: [
						{name: 'esdoc-es7-plugin'},
					],
				},
			},
		},

	});

	grunt.registerTask('default', ['clean', 'src']);

	grunt.registerTask('doc', ['esdoc']);
	grunt.registerTask('src', ['babel:src']);

	grunt.registerTask('check', ['jscs', 'eslint', 'babel', 'mochaTest:unit']);
	grunt.registerTask('test', ['babel:src', 'mochaTest']);
	grunt.registerTask('cover', ['exec:cover', 'remapIstanbul:build', 'exec:reportCoverage']);

	function loadEnv() {
		var result = {};
		try {
			require('fs').readFileSync('.env').toString().split('\n').forEach(function(line) {
				if (line[0] === '#') {
					return;
				}
				var i = line.indexOf('=');
				result[line.substring(0, i)] = line.substring(i + 1);
			});
		} catch (err) {
			if (err.code !== 'ENOENT') { throw err; }
		}
		return result;
	}

	grunt.registerTask('loadEnv', function() {
		var env = loadEnv();
		Object.keys(env).forEach(function(key) {
			process.env[key] = env[key];
		});
	});

};
