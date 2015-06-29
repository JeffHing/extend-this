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
// Module exports
//-------------------------------------

module.exports = require('./webpack.base.config.js')({
    output: {
        filename: 'extendThis.min.js'
    }
});
