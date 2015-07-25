/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Build commmands.
 */
'use strict';

//-------------------------------------
// Module dependencies and variables
//-------------------------------------

var CommandQueue = require('command-queue');

// Clean distribution command.
var cleanDistCmd = new CommandQueue().sync('rimraf dist', 'mkdir dist');

//
// Test commands
//

// Test source file.
var testCmd = 'karma start --single-run --#kdev';

// Test source file and watch for changes.
var testWatchCmd = 'karma start --#kdev';

// Test distribution file.
var testDistCmd = 'karma start --single-run --#kdist';

// Test minimized distribution file.
var testDistMinCmd = 'karma start --single-run --#kdistMin';

//
// Compile commands
//

// Create distribution file.
var webpackDistCmd = 'webpack --progress --#wdist';

// Create minified distribution file.
var webpackDistMinCmd = 'webpack -p --progress --#wdistMin';

//-------------------------------------
// Run build commands
//-------------------------------------

process.env.PATH += ';node_modules/.bin';

var queue = new CommandQueue();

switch (process.argv[2]) {
    case 'dev':
        queue.async(testWatchCmd).run();
        break;
    case 'test':
        queue.sync(testCmd).run();
        break;
    case 'dist':
        queue.sync(
            cleanDistCmd, testCmd,
            webpackDistCmd, testDistCmd,
            webpackDistMinCmd, testDistMinCmd).run();
        break;
}
