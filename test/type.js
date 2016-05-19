'use strict';

import typeValidators from '../src/type';

describe('Type', function() {
	it('should validate an array', function() {
		assert.isTrue(typeValidators.array([], null, this));

		assert.instanceOf(typeValidators.array('string', null, this), Error);
	});

	it('should validate a boolean', function() {
		assert.isTrue(typeValidators.bool(true));

		assert.instanceOf(typeValidators.bool('true'), Error);
	});

	it('should validate a function', function() {
		const testFn = function() {
			return;
		};

		assert.isTrue(typeValidators.func(testFn));

		assert.instanceOf(typeValidators.func('testFn'), Error);
	});

	it('should validate a number', function() {
		assert.isTrue(typeValidators.number(1));

		assert.instanceOf(typeValidators.number('1'), Error);
	});

	it('should validate a object', function() {
		const obj = {};

		assert.isTrue(typeValidators.object(obj));

		assert.instanceOf(typeValidators.object('obj'), Error);
	});

	it('should validate a string', function() {
		assert.isTrue(typeValidators.string('testString'));

		assert.instanceOf(typeValidators.string(false), Error);
	});

	it('should validate any type', function() {
		typeValidators.any('testString');
		typeValidators.any(false);
		typeValidators.any({});
		typeValidators.any(1);
		typeValidators.any(function() {});

	});

	it('should validate an array of a single type', function() {
		const arrayOfNumbers = typeValidators.arrayOf(typeValidators.number);

		assert.isTrue(arrayOfNumbers([1, 2, 3, 4]));

		assert.instanceOf(arrayOfNumbers([1, 2, 3, '4']), Error);

		assert.instanceOf(arrayOfNumbers({}), Error);
	});

	it('should validate an instance of a class', function() {
		class TestClass {
		}
		class TestClass2 {
		}

		const instanceOfFn = typeValidators.instanceOf(TestClass);

		assert.isTrue(instanceOfFn(new TestClass()));

		assert.instanceOf(instanceOfFn(new TestClass2()), Error);
	});

	it('should validate one of certain types', function() {
		const oneOfType = typeValidators.oneOfType(
			[
				typeValidators.string,
				typeValidators.number
			]
		);

		assert.isTrue(oneOfType('test'));

		assert.isTrue(oneOfType(1));

		assert.instanceOf(oneOfType({}), Error);
	});

	it('should fail if an array is not supplied to oneOfType', function() {
		var validator = typeValidators.oneOfType(
			{
				one: typeValidators.string
			}
		);

		assert.instanceOf(validator(), Error);
	});

	it('should validate an object with certain types of values', function() {
		const objectOf = typeValidators.objectOf(typeValidators.number);

		assert.isTrue(objectOf({
			a: 1,
			b: 2
		}));

		assert.instanceOf(objectOf({
			a: '1',
			b: '2'
		}), Error);
	});

	it('should validate a shape of an object', function() {
		const shape = typeValidators.shapeOf({
			a: typeValidators.string,
			b: typeValidators.number
		});

		assert.isTrue(shape({
			a: '1',
			b: 2
		}));

		assert.instanceOf(shape({
			a: '1',
			b: '2'
		}), Error);
	});

	it('should validate a shape nested within a shape', function() {
		const shape = typeValidators.shapeOf({
			a: typeValidators.shapeOf({
				b: typeValidators.string
			})
		});

		assert.isTrue(shape({
			a: {
				b: 'test'
			}
		}));

		assert.instanceOf(shape({
			a: {
				b: 1
			}
		}), Error);

		assert.instanceOf(shape({
			a: 1
		}), Error);
	});

	it('should fail if an object is not supplied to shape', function() {
		const validator = typeValidators.shapeOf(1);
		assert.instanceOf(validator(), Error);
	});

	it('should emit warning message', function() {
		const COMPONENT_NAME = 'componentName';
		const NAME = 'name';
		const PARENT_COMPONENT_NAME = 'parentComponent';

		const ERROR_MESSAGE = `Error: Warning: Invalid state passed to '${NAME}'. ` +
			`Expected type 'string' Passed to '${COMPONENT_NAME}'. Check render ` +
			`method of '${PARENT_COMPONENT_NAME}'.`;

		const context = {
			getRenderer: function() {
				return {
					lastParentComponent_: {
						name: PARENT_COMPONENT_NAME
					}
				};
			},
			name: COMPONENT_NAME
		};

		const resultError = typeValidators.string(1, NAME, context);

		assert.equal(resultError, ERROR_MESSAGE);
	});
});