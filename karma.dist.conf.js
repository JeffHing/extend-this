/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Karma configuration for testing non-minimized version.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var common = require('./karma.common');

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = function(config) {
    config.set(
        common('dist/extendThis.js')
    );
};
