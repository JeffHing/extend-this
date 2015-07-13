
/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Common webpack configuration values.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var extend = require('extend');

var common = {

    EXTEND_THIS_SOURCE: './src/extendThis.js',

    // Lint javascript.
    ESLINT_LOADER: {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
    }
};

var distConfig = {

    // Configuration for a distribution.
    distConfig: function(outputName) {

        return {
            entry: common.EXTEND_THIS_SOURCE,

            eslint: {
                failOnError: true
            },

            module: {
                loaders: [
                    common.ESLINT_LOADER
                ]
            },

            output: {
                filename: outputName,
                library: 'extendThis',
                libraryTarget: 'umd',
                path: 'dist/'
            }
        };
    }
};

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = extend({}, distConfig, common);
