'use strict';

import typeValidators from '../src/type';

describe('Type', function() {
	beforeEach(function() {
		sinon.stub(console, 'error');
	});

	afterEach(function() {
		console.error.restore();
	});

	it('should validate an array', function() {
		assert.isTrue(typeValidators.array([], null, this));
		assert.isFalse(console.error.called);

		assert.isTrue(typeValidators.array('string', null, this));
		assert.isTrue(console.error.called);
	});

	it('should validate a boolean', function() {
		assert.isTrue(typeValidators.bool(true));
		assert.isFalse(console.error.called);

		assert.isTrue(typeValidators.bool('true'));
		assert.isTrue(console.error.called);
	});

	it('should validate a function', function() {
		const testFn = function() {
			return;
		};

		assert.isTrue(typeValidators.func(testFn));
		assert.isFalse(console.error.called);

		assert.isTrue(typeValidators.func('testFn'));
		assert.isTrue(console.error.called);
	});

	it('should validate a number', function() {
		assert.isTrue(typeValidators.number(1));
		assert.isFalse(console.error.called);

		assert.isTrue(typeValidators.number('1'));
		assert.isTrue(console.error.called);
	});

	it('should validate a object', function() {
		const obj = {};

		assert.isTrue(typeValidators.object(obj));
		assert.isFalse(console.error.called);

		assert.isTrue(typeValidators.object('obj'));
		assert.isTrue(console.error.called);
	});

	it('should validate a string', function() {
		assert.isTrue(typeValidators.string('testString'));
		assert.isFalse(console.error.called);

		assert.isTrue(typeValidators.string(false));
		assert.isTrue(console.error.called);
	});

	it('should validate any type', function() {
		typeValidators.any('testString');
		typeValidators.any(false);
		typeValidators.any({});
		typeValidators.any(1);
		typeValidators.any(function() {});

		assert.isFalse(console.error.called);
	});

	it('should validate an array of a single type', function() {
		const arrayOfNumbers = typeValidators.arrayOf(typeValidators.number);

		assert.isTrue(arrayOfNumbers([1, 2, 3, 4]));
		assert.isFalse(console.error.called);

		assert.isTrue(arrayOfNumbers([1, 2, 3, '4']));
		assert.isTrue(console.error.called);

		assert.isTrue(arrayOfNumbers({}));
		assert.isTrue(console.error.called);
	});

	it('should validate an instance of a class', function() {
		class TestClass {
		}
		class TestClass2 {
		}

		const instanceOfFn = typeValidators.instanceOf(TestClass);

		assert.isTrue(instanceOfFn(new TestClass()));
		assert.isFalse(console.error.called);

		assert.isTrue(instanceOfFn(new TestClass2()));
		assert.isTrue(console.error.called);
	});

	it('should validate one of certain types', function() {
		const oneOfType = typeValidators.oneOfType(
			[
				typeValidators.string,
				typeValidators.number
			]
		);

		assert.isTrue(oneOfType('test'));
		assert.isFalse(console.error.called);

		assert.isTrue(oneOfType(1));
		assert.isFalse(console.error.called);

		assert.isTrue(oneOfType({}));
		assert.isTrue(console.error.called);
	});

	it('should fail if an array is not supplied to oneOfType', function() {
		typeValidators.oneOfType(
			{
				one: typeValidators.string
			}
		);

		assert.isTrue(console.error.called);
	});

	it('should validate an object with certain types of values', function() {
		const objectOf = typeValidators.objectOf(typeValidators.number);

		assert.isTrue(objectOf({
			a: 1,
			b: 2
		}));
		assert.isFalse(console.error.called);

		assert.isTrue(objectOf({
			a: '1',
			b: '2'
		}));
		assert.isTrue(console.error.called);
	});

	it('should validate a shape of an object', function() {
		const shape = typeValidators.shape({
			a: typeValidators.string,
			b: typeValidators.number
		});

		assert.isTrue(shape({
			a: '1',
			b: 2
		}));
		assert.isFalse(console.error.called);

		assert.isTrue(shape({
			a: '1',
			b: '2'
		}));
		assert.isTrue(console.error.called);
	});

	it('should validate a shape nested within a shape', function() {
		const shape = typeValidators.shape({
			a: typeValidators.shape({
				b: typeValidators.string
			})
		});

		assert.isTrue(shape({
			a: {
				b: 'test'
			}
		}));
		assert.isFalse(console.error.called);

		assert.isTrue(shape({
			a: {
				b: 1
			}
		}));
		assert.isTrue(console.error.called);

		assert.isTrue(shape({
			a: 1
		}));
		assert.isTrue(console.error.called);
	});

	it('should fail if an object is not supplied to shape', function() {
		typeValidators.shape(1);

		assert.isTrue(console.error.called);
	});
});