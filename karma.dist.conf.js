/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Karma configuration for testing minimized version.
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
    var options = karmaBaseConf();

    // Test using this source file
    options.webpack.resolve.alias['extend-this'] =
        path.join(__dirname, 'dist/extendThis.js');

    config.set(options);
};
