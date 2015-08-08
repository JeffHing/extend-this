/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * extendThis
 *
 * An extensible framework for defining 'recipes' for extending an
 * object from the properties of another object.
 *
 * Glossary
 * --------
 *
 * config
 *    The object containing the global configuration options.
 *
 * target
 *    The object being modified.
 *
 * source
 *    The object whose properties are being merged into the target.
 *
 * filter
 *    A function which can alter the property being applied to the target.
 *
 * method
 *    A function that can be invoked on the target object with predefined
 *    filters.
 *
 * selector
 *    A mechanism to select properties using a String, RegExp, or Object (mapping)
 *
 *
 * Algorithm
 * ---------
 * For each method call:
 *
 *     - Parse method arguments into selectors and filters.
 *     - Select properties to merge into target from selectors.
 *     - Pass properties through filter pipeline.
 *     - Apply each filtered property to the target object.
 *
 */
'use strict';

//--------------------------------------
// Types
//--------------------------------------

/*
 * The object passed into a filter.
 *
 * @typedef {object} filterContext
 * @property {object} target - The target object (readonly).
 * @property {object} source - The source object (readonly).
 * @property {string} sourceKey - The source property key (readonly).
 * @property {*} sourceValue -  The source property value (modifiable).
 * @property {string} targetKey - The target key (modifiable).
 */

/*
 * The object passed into a selector.
 *
 * @typedef {object} selectorContext
 * @property {object} source The source object (readonly).
 * @property {string} sourceKey The remaining text after the selector prefix (readonly).
 * @property {string} targetKey The target key (readonly).
 * @property {object} sourceKeys
 *     The keys of the object are the keys of the properties to merge into
 *     the target object. The values of the object are the target keys.
 *     (modifiable).
 * @property {object} overrideKeys
 *     The keys of the object are the source keys which should not report
 *     an error if the target key already exists in the target object
 *     (modifiable).
 */

//--------------------------------------
// Module dependencies and variables
//--------------------------------------

// Run apply faster.
var fastApply = require('fast-apply');

// Global configuration options.
var config = {
    filename: 'extendThis.js',
    throwPropertyNotFoundError: true,
    throwOverrideError: true
};

// String selectors.
var selectorsManager = createSelectorsManager();

// Methods for modifying the target object.
var methodsManager = createMethodsManager();

// Errors that can be thrown.
var errorManager = createErrorsManager();

// Optional extend function to handle other use cases.
var otherExtend = null;

//--------------------------------------
// Module exports
//--------------------------------------

module.exports = extend;

// Expose function to add selectors.
extend.selector = selectorsManager.addSelector;

// Expose function to add methods.
extend.method = methodsManager.addMethod;

// Expose the configuration.
extend.config = config;

// Allow a different extend function to be called to handle
// other use cases. It is called when there are more than 1
// arguments passed in.
extend.wrap = function(extendFunc) {
    otherExtend = extendFunc;
};

//--------------------------------------
// Default selectors and methods
//--------------------------------------

extend.selector('!', negationSelector);
extend.selector('#', overrideSelector);

extend.method('withCall', callMethod);
extend.method('withDelegate', delegateMethod);
extend.method('with', mixinMethod);

//--------------------------------------
// Core functions
//--------------------------------------

/*
 * Main entry point.
 *
 * Returns a set of methods which can be used to modify the target object.
 *
 * @param {object} target The object to modify.
 * @returns {object} An object where each property is a method.
 */
function extend(target) {
    if (arguments.length > 1 && otherExtend) {
        fastApply(otherExtend, null, arguments);
    }
    return methodsManager.setTarget(target);
}

/*
 * Parses the arguments passed into a method.
 *
 * @param {array} methodArgs
 *
 * If the first argument is a plain object, it is assumed to be the source object.
 * If the first argument is a string, it is assumed to be a property name and
 * the second argument is the property value
 *
 * Possible argument types:
 *    string    select property specified by string
 *    object    select properties specified by object keys
 *    regex     select properties that match the regular expression
 *    array     decompose array into individual arguments and reparse
 *    function  add filter to pipeline
 *
 * @returns {Object} params The values from the parsed arguments.
 * @returns {object} params.source The source object.
 * @returns {array} params.filters The filters.
 * @returns {object} params.sourceKeys
 *     The keys of the object are the keys of the properties to merge into
 *     the target object. The values of the object are the target keys.
 * @returns {object} params.overrideKeys
 *     The keys of the object are the source keys which should not report
 *     an error if the target key already exists in the target object.
 */
function parseMethodArgs(methodArgs) {

    var firstArg = methodArgs.shift(),
        source;

    if (isString(firstArg)) {
        if (methodArgs.length !== 1) {
            errorManager.illegalArgument(firstArg, 'Requires a single property value');
        }
        source = {};
        source[firstArg] = methodArgs.shift();

    } else if (isObject(firstArg)) {
        source = firstArg;

    } else {
        errorManager.illegalArgument(firstArg, 'No source object found.');
    }

    var overrideKeys = {}, // src keys which can override without error
        sourceKeys = {}, // src keys to pass to filters
        filters = []; // filters to process properties.

    // Iterate through the arguments separating them into selected
    // properties and filters.
    while (methodArgs.length) {
        var arg = methodArgs.shift();

        if (isString(arg)) {
            // Is a string selector
            if (!selectorsManager.executeSelector(source, arg, null,
                    sourceKeys, overrideKeys)) {
                sourceKeys[arg] = arg;
            }

        } else if (isRegex(arg)) {
            // Is a regular expression selector.
            extendSourceKeys(sourceKeys, source, arg);

        } else if (isArray(arg)) {
            // decompose array into separate arguments
            for (var j = 0; j < arg.length; j++) {
                methodArgs.push(arg[j]);
            }

        } else if (isFunction(arg)) {
            // Is a filter.
            filters.push(arg);

        } else if (isObject(arg)) {
            // Is a selector with rename.
            for (var sourceKey in arg) {
                var targetKey = arg[sourceKey];
                if (!selectorsManager.executeSelector(source, sourceKey,
                        targetKey, sourceKeys, overrideKeys)) {
                    sourceKeys[sourceKey] = targetKey;
                }
                if (!isString(sourceKeys[sourceKey])) {
                    errorManager.illegalArgument(targetKey,
                        'Target property name is not a string.');
                }
            }
        }
    }

    // If no properties specified, default to all properties in source.
    if (isEmpty(sourceKeys)) {
        extendSourceKeys(sourceKeys, source);
    }

    return {
        source: source,
        filters: filters,
        sourceKeys: sourceKeys,
        overrideKeys: overrideKeys
    };
}

/*
 * Modifies the target object using the specified properties and filters.
 */
function modifyTarget(target, source, sourceKeys, filters, overrideKeys) {

    // Arguments available to each filter.
    var filterContext = {
        target: target, // readonly
        source: source, // readonly
        sourceKey: null, // readonly
        targetKey: null,
        sourceValue: null
    };

    // For each property, send it through the filter pipeline and
    // then apply it to the target object.
    for (var sourceKey in sourceKeys) {
        filterContext.sourceKey = sourceKey;
        filterContext.targetKey = sourceKeys[sourceKey];

        // Throw an error if the source property name doesn't refer to a value.
        if (!(sourceKey in source)) {
            errorManager.propertyNotFound(sourceKey, source);
        }
        filterContext.sourceValue = source[sourceKey];

        // Apply the filters to the property.
        for (var i = 0; i < filters.length; i++) {
            if (!filters[i](filterContext)) {
                // Don't apply this property to the target.
                filterContext.targetKey = null;
                break;
            }
        }

        // Apply property to target.
        if (filterContext.targetKey !== null) {
            // Allow overwrite to take place. Developer can ignore error.
            var overwritten = filterContext.targetKey in target;

            target[filterContext.targetKey] = filterContext.sourceValue;

            if (overwritten && !overrideKeys[sourceKey]) {
                errorManager.propertyOverride(filterContext.targetKey, target);
            }
        }
    }
}


//--------------------------------------
// Methods
//--------------------------------------

/*
 * Creates an object for managing the methods.
 */
function createMethodsManager() {
    var methods = {};

    return {
        addMethod: addMethod,
        setTarget: setTarget
    };

    /*
     * Adds a method that will be available to extend the object.
     *
     * @param {string} name The method name
     * @param {function} [method] The handler for the specified method name.
     * @return {function} The handler for the specified method name.
     */
    function addMethod(name, method) {
        if (method !== undefined) {
            methods[name] = method;
        }
        return methods[name];
    }

    /*
     * Sets the target object to extend.
     *
     * @param {object} target The target object.
     */
    function setTarget(target) {
        var targetMethods = {};
        for (var name in methods) {
            targetMethods[name] = wrapMethod(target, methods[name]);
        }
        return targetMethods;
    }

    /*
     * Wraps the method so that it is executed with the appropriate
     * arguments.
     *
     * @param {object} target The target object.
     * @param {function} method The method to wrap.
     */
    function wrapMethod(target, method) {
        return function() {

            // Put arguments into a real array.
            var methodArgs = [];
            for (var i = 0; i < arguments.length; i++) {
                methodArgs.push(arguments[i]);
            }

            var params = method(target, parseMethodArgs, methodArgs);

            modifyTarget(target,
                params.source,
                params.sourceKeys,
                params.filters,
                params.overrideKeys);
            return this;
        };
    }
}

/*
 * A method which delegates method calls from the source object
 * to the target object.
 */
function delegateMethod(target, parseArgs, args) {
    var params = parseArgs(args);

    params.filters.unshift(createExcludeNameFilter(/^_/));
    params.filters.push(delegateFilter);

    return params;
}

/*
 * A method which simply does a shallow copy of the
 * source properties to the target object.
 */
function mixinMethod(target, parseArgs, args) {
    return parseArgs(args);
}

/*
 * A method  which calls the function with a
 * "this" object and uses the resulting properties as the source
 * properties to copy to the target object.
 */
function callMethod(target, parseArgs, args) {

    // The first argument should be a function or an array.
    var func = args[0],
        funcArgs = [],
        modifiedArgs = [];

    // Handles [func, arg1, arg2, arg3], ...
    if (isArray(func) && isFunction(func[0])) {
        funcArgs = func.splice(1);
        func = func[0];
        modifiedArgs = args.splice(1);

    } else if (isFunction(func)) {
        funcArgs = args.splice(1);

    } else {
        errorManager.illegalArgument(args,
            'first argument must be a function');
    }

    // The source properties will be added here.
    var Scope = function() {};

    // Ensure the function has access to the target's current properties,
    // so that it can make function calls for example.
    Scope.prototype = target;

    // Apply with scope.
    var scope = new Scope();
    fastApply(func, scope, funcArgs);

    // Copy the non-prototype properties to source.
    var source = {};
    for (var key in scope) {
        if (scope.hasOwnProperty(key)) {
            source[key] = scope[key];
        }
    }

    // Reconstruct the method args with the new source object.
    modifiedArgs.unshift(source);

    return parseArgs(modifiedArgs);
}

//--------------------------------------
// Selectors
//--------------------------------------

/*
 * Creates an object for managing string selectors.
 */
function createSelectorsManager() {
    var selectors = {};

    return {
        addSelector: addSelector,
        executeSelector: executeSelector
    };

    /*
     * Add a selector that matches source keys that start with the
     * specified prefix.
     *
     * @param {string} prefix
     * @param {function} [selector] The selector for the specified prefix.
     * @return {function} The selector for the specified prefix.
     */
    function addSelector(prefix, selector) {
        if (selector !== undefined) {
            selectors[prefix] = selector;
        }
        return selectors[prefix];
    }

    /*
     * Checks whether the source key matches one of the existing selectors.
     * If it does, the selector's handler is invoked on the source key.
     *
     * @param {object} source The source object.
     * @param {string} sourceKey The source object key.
     * @param {string} targetKey The target object key.
     * @param {object} sourceKeys The keys of the source properties to merge.
     * @param {object} overrideKeys
     *    The keys of the source properties to not report an error if the
     *    property already exists in the target object.
     */
    function executeSelector(source, sourceKey, targetKey,
        sourceKeys, overrideKeys) {

        for (var prefix in selectors) {
            // sourceKey starts with selector's prefix
            if (sourceKey.indexOf(prefix) === 0) {

                // Remove prefix from source key.
                sourceKey = sourceKey.substring(prefix.length);

                // Execute the selector's handler.
                selectors[prefix]({
                    source: source,
                    sourceKey: sourceKey,
                    targetKey: targetKey ? targetKey : sourceKey,
                    sourceKeys: sourceKeys,
                    overrideKeys: overrideKeys
                });

                return true;
            }
        }
        return false;
    }
}

/*
 * Selects all properties except the negated one.
 */
function negationSelector(selectorContext) {
    // If no properties currently selected, select them all first.
    if (isEmpty(selectorContext.sourceKeys)) {
        extendSourceKeys(selectorContext.sourceKeys, selectorContext.source);
    }
    // Then remove the negated property.
    if (selectorContext.sourceKeys[selectorContext.sourceKey] !== undefined) {
        delete selectorContext.sourceKeys[selectorContext.sourceKey];

    } else {
        // Throw error if negated property not found.
        errorManager.propertyNotFound(selectorContext.sourceKey, selectorContext.source);
    }
}

/*
 * Selects the property, but does not generate an error if the property
 * already exists in target.
 */
function overrideSelector(selectorContext) {
    selectorContext.overrideKeys[selectorContext.sourceKey] = true;
    selectorContext.sourceKeys[selectorContext.sourceKey] = selectorContext.targetKey;
}

//--------------------------------------
// Filters
//--------------------------------------

/*
 * Returns a filter which excludes properties that match the
 * provided regexp.
 *
 * @param {RegExp}
 * @returns {function} The filter.
 */
function createExcludeNameFilter(regexp) {
    return function(filterContext) {
        return !regexp.test(filterContext.sourceKey);
    };
}

/*
 * A filter which delegates methods calls from the target object
 * to the source object.
 */
function delegateFilter(filterContext) {
    if (isFunction(filterContext.sourceValue)) {
        var func = filterContext.sourceValue;
        var source = filterContext.source;
        filterContext.sourceValue = function() {
            return fastApply(func, source, arguments);
        };
    }
    return true;
}


//--------------------------------------
// Utility functions
//--------------------------------------

function isObject(value) {
    if (value === null) {
        return false;
    }
    return typeof value === 'object';
}

function isEmpty(object) {
    for (var name in object) {
        if (object.hasOwnProperty(name)) {
            return false;
        }
    }
    return true;
}

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}

function isRegex(value) {
    return value instanceof RegExp;
}

function isString(value) {
    return typeof value === 'string';
}

function isFunction(value) {
    return typeof value === 'function';
}

/*
 * Copies the keys in the source object to the sourceKey object.
 */
function extendSourceKeys(sourceKeys, source, regexp) {
    for (var key in source) {
        if (!regexp || regexp.test(key)) {
            sourceKeys[key] = key;
        }
    }
}

/*
 * Removes cyclical dependencies.
 */
function stringify(object) {
    var seen = [];
    return JSON.stringify(object, function(key, val) {
        if (val !== null && typeof val === 'object') {
            if (seen.indexOf(val) >= 0) {
                return undefined;
            }
            seen.push(val);
        }
        return val;
    });
}

//--------------------------------------
// Errors
//--------------------------------------

function createErrorsManager() {

    return {
        illegalArgument: illegalArgument,
        propertyNotFound: propertyNotFound,
        propertyOverride: propertyOverride
    };

    function illegalArgument(arg, message) {
        var full = stringify(arg) + ': ' + message;
        throw new Error(formatMessage('Illegal argument', full));
    }

    function propertyNotFound(key, object) {
        if (config.throwPropertyNotFoundError) {
            var message = key + ' in ' + stringify(object);
            throw new Error(formatMessage('Property not found', message));
        }
    }

    function propertyOverride(key, object) {
        if (config.throwOverrideError) {
            var message = key + ' in ' + stringify(object);
            throw new Error(formatMessage('Property already exists',
                message));
        }
    }

    function formatMessage(name, message) {
        if (!isString(message)) {
            message = stringify(message);
        }
        return config.filename + ': ' + name + ': ' + message;
    }
}
