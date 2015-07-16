/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Webpack configuration for minimized distribution.
 *
 * It is assumed webpack is called with the -p option.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var webpackBase = require('./webpack.base');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = webpackBase.distConfig(webpackBase.library.minFilename);
