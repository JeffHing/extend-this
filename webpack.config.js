/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Webpack configuration for non-minimized distribution.
 */
'use strict';

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = require('./webpack.base.config.js')({
    output: {
        filename: 'extendThis.js'
    }
});
