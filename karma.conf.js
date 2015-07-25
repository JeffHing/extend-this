/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Karma configurations.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var flags = require('minimist')(process.argv.slice(2));
var path = require('path');
var karmaWebpackPlugin = require('karma-webpack');
var webpackConfig = require('./webpack.config');

/*
 * Creates a karma configuration.
 *
 * @param {string} sourceFile The source file to test
 * @param {array} loaders An array of loaders to apply to the source file.
 */
function createConf(sourceFile, loaders) {

    var allLoaders = [];
    var testFilesPattern = 'src/**/*.test.js';

    if (loaders) {
        allLoaders.concat(loaders);
    }

    // Return a new instance each time.
    var conf = {

        browsers: ['PhantomJS'],

        files: [
            // https://github.com/webpack/style-loader/issues/31
            'node_modules/phantomjs-polyfill/bind-polyfill.js',

            testFilesPattern
        ],

        frameworks: ['jasmine'],

        plugins: [
            karmaWebpackPlugin,
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],

        preprocessors: {},

        reporters: [
            'dots'
        ],

        webpack: {
            module: {
                loaders: allLoaders
            },
            resolve: {
                alias: {}
            }
        },

        webpackMiddleware: {
            noInfo: true
        }

    };

    // Resolve to the correct file for testing.
    conf.webpack.resolve.alias[webpackConfig.library.projectName] =
        path.join(__dirname, sourceFile);

    conf.preprocessors[testFilesPattern] = ['webpack'];

    return conf;
}

//-------------------------------------
// Module exports
//-------------------------------------
if (flags['#kdist']) {
    module.exports = function(config) {
        config.set(createConf(
            'dist/' + webpackConfig.library.filename
        ));
    };

} else if (flags['#kdistMin']) {
    module.exports = function(config) {
        config.set(createConf(
            'dist/' + webpackConfig.library.filenameMin
        ));
    };

} else if (flags['#kdev']) {
    module.exports = function(config) {
        config.set(createConf(
            webpackConfig.library.sourceFile,
            webpackConfig.library.sourceLoaders
        ));
    };
}
