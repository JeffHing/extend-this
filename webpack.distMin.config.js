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

var common = require('./webpack.common.js');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = common.distConfig('extendThis.min.js');
