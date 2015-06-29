/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Karma configuration for testing un-minimized version.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables.
//-------------------------------------

var path = require('path');
var karmaBaseConf = require('./karma.base.conf');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = function(config) {
    config.set(karmaBaseConf({
        webpack: {
            resolve: {
                alias: {
                    // Test using this source file
                    'extendThis': path.join(__dirname, 'src/extendThis.js')
                }
            },

            module: {
                loaders: [{
                    // Lint un-minified javascript
                    test: /\.js$/,
                    loader: 'eslint-loader',
                    exclude: /node_modules/
                }]
            }
        }
    }));
};
