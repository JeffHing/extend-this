/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Common karma configuration values.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var path = require('path');
var karmaWebpackPlugin = require('karma-webpack');
var webpackBase = require('./webpack.base');

//-------------------------------------
// Module exports
//-------------------------------------

/*
 * @param {string} sourceFile The source file to test
 * @param {array} loaders An array of loaders to apply to the source file.
 */
module.exports = function(sourceFile, loaders) {

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

    conf.webpack.resolve.alias[webpackBase.library.projectName] =
        path.join(__dirname, sourceFile);

    conf.preprocessors[testFilesPattern] = ['webpack'];

    return conf;
};
