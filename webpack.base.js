
/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Common webpack configuration values.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

// Webpack loaders.
var loaders = {

    // Lint javascript.
    eslint: {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
    }
};

// Library settings.
var library = {

    // GitHub project name.
    projectName: 'extend-this',

    // Name of library variable for non-module build environments.
    variable: 'extendThis',

    // Filename of library.
    filename: 'extendThis.js',

    // Filename of minimized library.
    minFilename: 'extendThis.min.js',

    // Path to library source.
    sourceFile: './src/extendThis.js',

    // Loaders to load the library source.
    sourceLoaders: [
        loaders.eslint
    ]
};

// Distribution configuration.
var distConfig = function(outputName) {

    return {
        entry: library.sourceFile,

        eslint: {
            failOnError: true
        },

        module: {
            loaders: library.sourceLoaders
        },

        output: {
            filename: outputName,
            library: library.variable,
            libraryTarget: 'umd',
            path: 'dist/'
        }
    };
};

//-------------------------------------
// Module exports
//-------------------------------------

module.exports = {
    distConfig: distConfig,
    library: library
};
