/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Karma configuration for testing minimized version.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var karmaBase = require('./karma.base');
var webpackBase = require('./webpack.base');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = function(config) {
    config.set(
        karmaBase('dist/' + webpackBase.library.minFilename)
    );
};
