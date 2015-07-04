/*
 * Copyright 2015. Author: Jeffrey Hing. All Rights Reserved.
 *
 * MIT License
 *
 * Unit tests for extendThis.js.
 */
'use strict';

var extend = require('extend-this');

describe('extendThis.js:', function() {

    // Pet class
    function Pet(name, color, type) {
        this._name = name;
        this._color = color;
        this._type = type;
    }
    Pet.prototype.name = function() {
        return this._name;
    };
    Pet.prototype.color = function() {
        return this._color;
    };
    Pet.prototype.type = function() {
        return this._type;
    };

    //----------------------------------
    // String selector tests
    //----------------------------------

    describe('selecting properties with no string selector', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype);

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.name()).toBe('ralph');
            expect(dog.color()).toBe('red');
            expect(dog.type()).toBe('dog');
        });
    });

    describe('selecting properties with string selector', function() {

        function Dog() {
            extend(this).withCall([Pet, 'ralph', 'red', 'dog'], '_color');
        }
        extend(Dog.prototype).with(Pet.prototype, 'color');

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.color()).toBe('red');
            expect(dog.name).toBe(undefined);
            expect(dog._name).toBe(undefined);
            expect(dog.type).toBe(undefined);
            expect(dog._type).toBe(undefined);
        });
    });

    //----------------------------------
    // Array selector tests
    //----------------------------------

    describe('selecting properties with array selector', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype, ['name', 'color', ['type']]);

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.name()).toBe('ralph');
            expect(dog.color()).toBe('red');
            expect(dog.type()).toBe('dog');
        });
    });

    //----------------------------------
    // Regular expression selector tests
    //----------------------------------

    describe('selecting properties with regex', function() {

        function Dog() {
            extend(this).withCall([Pet, 'ralph', 'red', 'dog'], /_color/);
        }
        extend(Dog.prototype).with(Pet.prototype, /color/);

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.color()).toBe('red');
            expect(dog.name).toBe(undefined);
            expect(dog._name).toBe(undefined);
            expect(dog.type).toBe(undefined);
            expect(dog._type).toBe(undefined);
        });
    });

    describe('selecting properties with regexp and map', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype, /.*/, {
            color: 'dogColor'
        });

        it('should mixin the correct properties', function() {
            var dog = new Dog();
            expect(dog.dogColor()).toBe('red');
            expect(dog.name()).toBe('ralph');
            expect(dog.type()).toBe('dog');
        });
    });

    //----------------------------------
    // Rename selector tests
    //----------------------------------

    describe('renaming properties with map', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype, {
            color: 'dogColor',
            name: 'dogName',
            type: 'dogType'
        });

        it('should mixin the correct properties', function() {
            var dog = new Dog();
            expect(dog.dogColor()).toBe('red');
            expect(dog.dogName()).toBe('ralph');
            expect(dog.dogType()).toBe('dog');
        });
    });

    describe('renaming properties with map and non-string value', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }

        it('should throw an illegal property error', function() {
            var error = new Error('extendThis.js: Illegal argument: []: ' +
                'Target property name is not a string.');
            expect(function() {
                extend(Dog.prototype).with(Pet.prototype, {
                    color: []
                });
            }).toThrow(error);
        });
    });

    //----------------------------------
    // Inlines filter tests
    //----------------------------------

    describe('selecting properties with inline filter', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype, function(filterContext) {
            var map = {
                name: 'dogName',
                color: 'dogColor'
            };
            var targetKey = map[filterContext.sourceKey];
            if (targetKey !== undefined) {
                filterContext.targetKey = targetKey;
                return true;
            }
            return false;
        });

        it('should mixin the correct properties', function() {
            var dog = new Dog();
            expect(dog.dogColor()).toBe('red');
            expect(dog.dogName()).toBe('ralph');
            expect(dog.dogType).toBe(undefined);
        });
    });

    describe('selecting properties with multiple inline filters', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype,
            function(filterContext) {
                filterContext.targetKey += 'a';
                return true;
            },
            function(filterContext) {
                filterContext.targetKey += 'b';
                return true;
            }
        );

        var dog = new Dog();

        it('should apply filters in the order they are added', function() {
            expect(dog.colorab()).toBe('red');
            expect(dog.nameab()).toBe('ralph');
            expect(dog.typeab()).toBe('dog');
        });
    });

    //----------------------------------
    // Negation tests
    //----------------------------------

    describe('selecting properties with negation modifier', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype, '!color');

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.name()).toBe('ralph');
            expect(dog.type()).toBe('dog');
            expect(dog.color).toBe(undefined);
        });
    });

    //----------------------------------
    // Override tests
    //----------------------------------

    describe('selecting property that exists in target prototype', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        Dog.prototype.name = function() {};

        it('should throw an override error', function() {
            var error = new Error(
                'extendThis.js: Property already exists: name in {}');
            expect(function() {
                extend(Dog.prototype).with(Pet.prototype);
            }).toThrow(error);
        });
    });

    describe('selecting property that exists in target', function() {

        function Dog() {
            this._name = 'fred';
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype);

        it('should throw an override error', function() {
            var error = new Error(
                'extendThis.js: Property already exists: ' +
                '_name in {"_name":"ralph"}');
            expect(function() {
                new Dog(); // eslint-disable-line no-new
            }).toThrow(error);
        });
    });

    describe('disabling override error using override modifier', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        Dog.prototype.name = function() {};

        extend(Dog.prototype).with(Pet.prototype, /.*/, '#name');

        it('should mixin the correct properties', function() {
            var dog = new Dog();
            expect(dog.color()).toBe('red');
            expect(dog.name()).toBe('ralph');
            expect(dog.type()).toBe('dog');
        });

    });

    //----------------------------------
    // Non-existant source property tests
    //----------------------------------

    describe('selecting non-existant source property', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }

        it('should throw a property not found error', function() {
            var error = new Error('extendThis.js: Property not found: ' +
                'cat in {}');
            expect(function() {
                extend(Dog.prototype).with(Pet.prototype, 'cat');
            }).toThrow(error);
        });
    });

    describe('selecting non existant property with negation', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        it('should throw a property not found error', function() {
            var error = new Error('extendThis.js: Property not found: ' +
                'cat in {}');
            expect(function() {
                extend(Dog.prototype).with(Pet.prototype, '!cat');
            }).toThrow(error);
        });
    });

    //----------------------------------
    // Call tests
    //----------------------------------

    describe('calling constructor with non-array format', function() {

        function Dog() {
            extend(this).withCall(Pet, 'ralph', 'red', 'dog');
        }
        extend(Dog.prototype).with(Pet.prototype);

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.name()).toBe('ralph');
            expect(dog.color()).toBe('red');
            expect(dog.type()).toBe('dog');
        });
    });

    describe('calling constructor with array format', function() {

        function Dog() {
            extend(this).withCall([Pet, 'ralph', 'red', 'dog'], '_color');
        }
        extend(Dog.prototype).with(Pet.prototype, 'color');

        var dog = new Dog();

        it('should mixin the correct property', function() {
            expect(dog.color()).toBe('red');
            expect(dog._color).toBe('red');
            expect(dog.name).toBe(undefined);
            expect(dog._name).toBe(undefined);
            expect(dog.type).toBe(undefined);
            expect(dog._type).toBe(undefined);
        });
    });

    describe('calling prototype method from constructor', function() {

        function Person(height) {
            this.height(height);
        }
        Person.prototype.height = function(height) {
            if (height !== undefined) {
                this._height = height;
            }
            return this._height;
        };

        function Recruit() {
            extend(this).withCall(Person, 5);
        }
        extend(Recruit.prototype).with(Person.prototype);

        var recruit = new Recruit();

        it('should succeed', function() {
            expect(recruit.height()).toBe(5);
        });
    });

    //----------------------------------
    // Delegation tests
    //----------------------------------

    describe('Composing object with delegation', function() {

        function Height(height) {
            this.height = height; // non-function property
            this._func = function() {}; // private function property;
        }

        function Dog() {
            extend(this).withDelegate(new Pet('ralph', 'red', 'dog'));
            extend(this).withDelegate(new Height(10));
        }

        var dog = new Dog();

        it('should delegate to the correct methods', function() {
            expect(dog.name()).toBe('ralph');
            expect(dog.color()).toBe('red');
            expect(dog.type()).toBe('dog');
        });

        it('should delegate to the correct objects', function() {
            expect(dog.height).toBe(10);
        });

        it('should not include private properties', function() {
            expect(dog._name).toBe(undefined);
            expect(dog._color).toBe(undefined);
            expect(dog._type).toBe(undefined);
            expect(dog._func).toBe(undefined);
        });
    });

    //----------------------------------
    // Individual property tests.
    //----------------------------------
    describe('Adding individual property', function() {

        function Dog() {
            extend(this).with('owner', 'me');
        }

        var dog = new Dog();

        it('should add the correct property', function() {
            expect(dog.owner).toBe('me');
        });
    });

    describe('Adding individual property without a value', function() {

        function Dog() {
            extend(this).with('owner');
        }

        it('should throw an illegal property error', function() {
            var error = new Error('extendThis.js: Illegal argument: "owner": ' +
                'Requires a single property value');
            expect(function() {
                new Dog(); // eslint-disable-line no-new
            }).toThrow(error);
        });
    });

    //----------------------------------
    // Wrap extend function
    //----------------------------------

    describe('Wrapping other extend function', function() {

        it('should call the other extend function', function() {
            var source = {};
            var target = {};

            this.otherExtend = function() {};

            spyOn(this, 'otherExtend');

            extend.wrap(this.otherExtend);

            extend(source, target);
            expect(this.otherExtend).toHaveBeenCalledWith(source, target);

            extend.wrap(null);
        });
    });

    //----------------------------------
    // Method function
    //----------------------------------

    describe('Adding a method', function() {
        it('should return my method', function() {
            var func = function() {};
            extend.method('funcA', func);
            expect(extend.method('funcA')).toBe(func);
            extend.method('funcA', null);
        });
    });

    //----------------------------------
    // Selector function
    //----------------------------------

    describe('Adding a selector', function() {
        it('should return my selector', function() {
            var selector = function() {};
            extend.selector('&', selector);
            expect(extend.selector('&')).toBe(selector);
            extend.selector('&', null);
        });
    });

    //----------------------------------
    // Object.defineProperty
    //----------------------------------

    describe('Merging property created with Object.defineProperty', function() {
        var source = {};

        Object.defineProperty(source, 'sound', {
            enumerable: true,
            get: function() {
                return 'meow';
            }
        });

        it('should still work', function() {
            var target = {};

            expect(source.sound).toBe('meow');
            extend(target).with(source);
            expect(target.sound).toBe('meow');
        });
    });

    //----------------------------------
    // Misc Tests.
    //----------------------------------

    describe('Calling method without a source object', function() {

        function Dog() {
            extend(this).with(function() {});
        }

        it('should throw an illegal property error', function() {
            var error = new Error('extendThis.js: Illegal argument: undefined: ' +
                'No source object found.');
            expect(function() {
                new Dog(); // eslint-disable-line no-new
            }).toThrow(error);
        });
    });

    describe('Stringifying object with cyclical dependency', function() {
        function Dog() {
            // Create object with cyclical dependency.
            var source = {
                value: true
            };
            source.self = source;

            extend(this).with(source, '!foobar');
        }

        it('should succeed', function() {
            var error = new Error('extendThis.js: Property not found: foobar in ' +
                '{"value":true}');
            expect(function() {
                new Dog(); // eslint-disable-line no-new
            }).toThrow(error);
        });
    });
});
