/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * A function which returns the webpack configuration merged
 * with the provided options.
 *
 * @example
 *    var config = require('./webpack.base.config.js)({ ... });
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var extend = require('extend');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = function(options) {

    // Return a new instance each time.
    var config = {

        // Library source file.
        entry: './src/extendThis.js',

        eslint: {
            failOnError: true
        },

        module: {
            loaders: [{
                // lint javascript
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }]
        },

        // Output in UMD format to dist directory.
        output: {
            library: 'extendThis',
            libraryTarget: 'umd',
            path: './dist'
        }
    };

    extend(true, config, options);

    return config;
};
