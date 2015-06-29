/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * A function which returns the karma configuration merged
 * with the provided options.
 *
 * @example
 *    var karmaBaseConf = require('./karma.base.conf.js);
 *    config.set(karmaBaseConf({...});
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var extend = require('extend');
var karmaWebpackPlugin = require('karma-webpack');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = function(options) {

    var testFilesPattern = 'src/*.test.js';

    // Return a new instance each time.
    var finalOptions = {

        browsers: ['PhantomJS'],

        frameworks: ['jasmine'],

        files: [
            // https://github.com/webpack/style-loader/issues/31
            'node_modules/phantomjs-polyfill/bind-polyfill.js',

            testFilesPattern
        ],

        webpackMiddleware: {
            noInfo: false
        },

        plugins: [
            karmaWebpackPlugin,
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],

        preprocessors: {},

        reporters: ['progress']
    };

    finalOptions.preprocessors[testFilesPattern] = ['webpack'];

    extend(true, finalOptions, options);

    return finalOptions;
};
