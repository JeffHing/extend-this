<!-- Copyright 2015. Author: Jeffrey Hing. All Rights Reserved. MIT License -->  

# ExtendThis

ExtendThis is an extensible framework for defining "recipes" for extending an
object using properties from other objects. It evolved from the need to
selectively compose an object's API using composition (rather than 
inheritance). Out-of-the-box, it supports extending objects through delegation 
and mixins. However, its API has been generalized to allow 
it to support arbitrary "recipes" for extending objects.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
   - [Delegation](#delegation)
   - [Mixins](#mixins)
   - [Property Selectors](#property-selectors)
   - [Filters](#filters)
   - [Methods](#methods)
   - [Array Arguments](#array-arguments)
   - [Configuration](#configuration)
   - [Multiple extend Functions](#multiple-extend-functions)
- [Limitations](#limitations)

## Features

* An extensible vocabulary for selecting object properties.
* An extensible set of filters for filtering object properties.
* An extensible set of methods for applying preselected filters to object properties. 
* Detection of namespace collisions when merging object properties.
* Ability to rename and redefine the default APIs according to your preferences.
* Compatibility with CommonJS, AMD, and non-module build environments.
* Less than 5K minified.

## Installation

To install the package:

    npm install extend-this
    
To require the package:    

```javascript
var extend = require("extend-this");
```    

## Usage

### Delegation

To delegate method calls to another object, use the 
`extend.withDelegate()` method:

```javascript    
/*
 * @constructor
 */
function Mutant() {
    extend(this)
        .withDelegate(new Dog())
        .withDelegate(new Cat());
}

var mutant = new Mutant();
mutant.bark();
mutant.meow();
```
    
Properties beginning with underscore are ignored, and non-function properties
are copied (shallow).

    
### Mixins

To mixin the APIs from another object, use the `extend.withCall()` and 
`extend.with()` methods:

```javascript    
/*
 * @constructor
 */
function Rectangle(length, width) {
    this._length = length;
    this._width = width;
}
Rectangle.prototype.area = function() {
    return this._length * this._width;
}

/*
 * @constructor
 */
function MyShape() {
    extend(this).withCall(Rectangle, 5, 4);
}
extend(MyShape.prototype).with(Rectangle.prototype);

var myShape = new MyShape();
console.log(myShape.area());
console.log(myShape._length);
console.log(myShape._width);
```

**Note:**
If you want to use the `extend.withCall()` method in combination with the
selectors and filters described below, pass the constructor and its arguments
in an array followed by the filter or selector arguments.

    extend(this).withCall([Rectangle, 5, 4], '!type');
    
    
### Property Selectors

By default all properties of the source object are merged with the properties
of the target object. However this can be overridden using property selectors.

#### String Selector

Merges the properties with the specified name:

    extend(this).withDelegate(new Dog(), 'bark', 'owner');
    
#### Negation Selector

Merges all properties except the ones prefixed with the '!' character:

    extend(this).withDelegate(new Dog(), '!type', '!color');

#### Regular Expression Selector

Merges all properties that match the regular expression:

    extend(this).withDelegate(new Dog(), /bark/);
    
#### Rename Selector

Merges the properties with the specified names, but renames the properties
when applied to the target object:

```javascript    
/*
 * @constructor
 */
function Mutant() {
    extend(this).withDelegate(new Dog(), {
        bark: sound,
        owner: person
    }
});

var mutant = new Mutant();
mutant.sound();
mutant.person();
```

#### Override Selector

Merges the property with the specified name, but doesn't report an
error if the property already exists in the target object:

```javascript    
extend(this).withDelegate(new Dog(), '#bark');
```
    
    
#### Selector Combinations

Different selector types can be used together.

This example merges all properties but renames the `bark()` method to 
the `sound()` method:

```javascript    
extend(this).withDelegate(new Dog(), /.*/, {bark: sound});
```
    
This example renames the `bark()` method to the `sound()` method and disables any
error if the `sound()` method already exists in the target object:

```javascript    
extend(this).withDelegate(new Dog(), {'#bark': sound});
```
    
#### Changing a Selector Prefix

To change the prefix used by a selector, use the `extend.selector()` method. The 
following calls change the override selector to use the '@' prefix 
instead of the '#' prefix.

```javascript    
extend.selector('@', extend.selector('#'));
extend.selector('#', null);
```

#### Adding a Selector

To add your own selector, use the `extend.selector()` method. The following
call adds a selector which is invoked whenever a string is prefixed with '*'.

```javascript    
extend.selector('*', mySelector);
```
    
The selector is passed a `selectorContext` object which contains the
`sourceKeys` object. The `sourceKeys` object should be updated with the keys of 
the properties to merge into the target object.

```javascript    
/*
 * A selector which merges all properties from the source object
 * and does not report an error if the property already exists in the 
 * target object.
 *
 * @param selectorContext.source {object}
 *     The source object (read-only).
 * @param selectorContext.sourceKey {string}
 *     The remaining text after the selector prefix (read-only).
 * @param selectorContext.targetKey
 *     The key to use when applying the property to the target (read-only).
 * @param selectorContext.sourceKeys {object}
 *     The keys of the object are the keys of the properties to merge into
 *     the target object. The values of the object are the target keys.
 *     (modifiable).
 * @param selectorContext.overrideKeys {object} 
 *     The keys of the object are the source keys which should not report
 *     an error if the target key already exists in the target object (modifiable).
 */
function mySelector(selectorContext) {
    var source = selectorContext.source;
        sourceKeys = selectorContext.sourceKeys;
        overrideKeys = selectorContext.overrideKeys;
    
    for (var key in source) {
        sourceKeys[key] = key;
        overrideKeys[key] = true;
    }
};
```
    
### Filters    

Filters can be used to reject properties and transform properties.
Filters form a filter pipeline where a property is passed from one filter to 
the next.

```javascript    
extend(this).with(new Dog(), myFilter, anotherFilter);
```

Each filter is passed a `filterContext` object which contains the property 
being merged  plus additional contextual information. The filter can modify
the source property value and the target key. It is expected to return true 
if the property can be merged, and false if the property should be rejected.

Here is the filter used by the `extend.withDelegate()` method to delegate method
calls to the source object:

```javascript    
/*
 * A filter which transforms the source functions to functions which can
 * be called from the context of the target object.
 *
 * @param filterContext.target {object}
 *    The target object (read-only).
 * @param filterContext.source {object}
 *    The source object (read-only).
 * @param filterContext.sourceKey {string}
 *    The source property key (read-only).
 * @param filterContext.sourceValue {*} 
 *    The source property value (modifiable).
 * @param filterContext.targetKey {string}
 *    The target key (modifiable).
 *
 * @returns {boolean} true to allow property to be merged
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
```

Here is the filter used by the `extend.withDelegate()` method to exclude all
properties beginning with the underscore character.

```javascript    
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
```

The following call is equivalent to calling `extend.withDelegate(new Dog());`.

```javascript    
extend(this).with(new Dog(), createExcludeFilter(/^_/), delegateFilter);
```
    
### Methods    

Methods allow you to fully operate on the target and source object. However
their main purpose is to allow you to preselect which filters are applied to the 
properties rather than having to pass-in each individual filter as a parameter.

#### Adding a Method

To add a new method, use the `extend.method()`. This example shoes how the 
`extend.withDelegate()` method is added to extendThis:

```javascript    
extend.method('withDelegate', delegateMethod);
```
    
Every method is passed a parser function and the user provided arguments. 
A method can manipulate the arguments as needed, and then pass
the arguments to the parser function. The output of the parser function
can than be manipulated by the method before it is returned.

In this case, `delegateMethod()` simply adds the `excludeNameFilter` at the 
front of the filter pipeline, and the `delegateFilter` at the end of the filter 
pipeline. 

**Note:** The advantage of adding filters using a method, as opposed
to passing them in as method arguments, is that the filters are assured to be 
added before and after the user provided arguments.


```javascript    
/*
 * A method which delegates method calls from the target object to
 * the source object.
 *
 * @param {Object} target The target object.
 * @param {function} parseArgs The parser function.
 * @param {args} args The arguments passed to the method.
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
function delegateMethod(target, parseArgs, args) {
    var params = parseArgs(args);

    params.filters.unshift(createExcludeNameFilter(/^_/));
    params.filters.push(delegateFilter);

    return params;
}
```

#### Changing a Method Name

To change a method name, use the `extend.method()` call.
The following calls change the 'with' method name to 'withMixin'.

```javascript    
extend.method('withMixin', extend.method('with'));
extend.method('with', null);
```
### Array Arguments

Arguments passed to a method can be included in one or more arrays. The arrays 
can be nested. This allows arguments to be packaged as a single argument.

```javascript    
var myRecipe = [];
myRecipe.push(filter1);
myRecipe.push(filter2);
myRecipe.push(['propA', 'propB']);

extend(this).with(source, myRecipe);
```

### Configuration     

To turn off namespace collision detection:

```javascript    
extend.config.throwOverrideError = false;
```
    
To turn off property not found errors:    

```javascript    
extend.config.throwPropertyNotFoundError = false;

```

### Multiple extend Functions

There may be a different extend function which you may want to use in addition
to extendThis. To allow the other extend function to be invoked from extendThis,
use the `extend.wrap()` method:

```javascript    
extend.wrap(otherExtendFunc);
```

The other extend function will be invoked whenever extendThis is passed more 
than one argument:

```javascript    
extend(target, source);
```
    
## Limitations

ExtendThis cannot detect namespace collisions if a property is added after
its API call. For example:

```javascript    
extend(this).with(source, 'foo');
this.foo = 'red';
```
    
This will not generate an error. Dependending upon the context, you may have 
wanted to be alerted that the property 'foo' from the source object, collides 
with the local property 'foo'.

ExtendThis offers an alternative way of setting the 'foo' property using the 
following method call:

```javascript    
extend(this)
    .with(source, 'foo')
    .with('foo', 'red');
```

In this case, an error will be generated that the 'foo' property already exists.
