/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Karma configuration for testing source files.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var common = require('./karma.common');
var commonWebpack = require('./webpack.common');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = function(config) {
    config.set(
        common(commonWebpack.EXTEND_THIS_SOURCE, [
            commonWebpack.ESLINT_LOADER
        ])
    );
};
