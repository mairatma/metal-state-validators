'use strict';

import assert from 'assert';
import sinon from 'sinon';
import typeValidators from '../src/type';

describe('Type', function() {
	beforeEach(function() {
		console.error = sinon.stub();
		this.getRenderer = sinon.stub();
	});

	it('should validate an array', function() {
		typeValidators.array([]);
		assert(!console.error.called);

		typeValidators.array('string');
		assert(console.error.called);
	});

	it('should validate a boolean', function() {
		typeValidators.bool(true);
		assert(!console.error.called);

		typeValidators.bool('true');
		assert(console.error.called);
	});
	//
	it('should validate a function', function() {
		var testFn = function() {
			return;
		};

		typeValidators.func(testFn);
		assert(!console.error.called);

		typeValidators.func('testFn');
		assert(console.error.called);
	});

	it('should validate a number', function() {
		typeValidators.number(1);
		assert(!console.error.called);

		typeValidators.number('1');
		assert(console.error.called);
	});

	it('should validate a object', function() {
		var obj = {};

		typeValidators.object(obj);
		assert(!console.error.called);

		typeValidators.object('obj');
		assert(console.error.called);
	});

	it('should validate a string', function() {
		typeValidators.string('testString');
		assert(!console.error.called);

		typeValidators.string(false);
		assert(console.error.called);
	});

	it('should validate any type', function() {
		typeValidators.any('testString');
		typeValidators.any(false);
		typeValidators.any({});
		typeValidators.any(1);
		typeValidators.any(function() {});

		assert(!console.error.called);
	});

	it('should validate an array of a single type', function() {
		var arrayOfNumbers = typeValidators.arrayOf(typeValidators.number);

		arrayOfNumbers([1, 2, 3, 4]);
		assert(!console.error.called);

		arrayOfNumbers([1, 2, 3, '4']);
		assert(console.error.called);

		arrayOfNumbers({});
		assert(console.error.called);
	});

	it('should validate an instance of a class', function() {
		class TestClass {};
		class TestClass2 {};

		var instanceOfFn = typeValidators.instanceOf(TestClass);

		instanceOfFn(new TestClass());
		assert(!console.error.called);

		instanceOfFn(new TestClass2());
		assert(console.error.called);
	});

	it('should validate one of various types', function() {
		var oneOf = typeValidators.oneOfType(
			[
				typeValidators.string,
				typeValidators.number
			]
		);

		oneOf('test');
		assert(!console.error.called);

		oneOf(1);
		assert(!console.error.called);

		oneOf({});
		assert(console.error.called);
	});

	it('should validate an object with certain types of values', function() {
		var objectOf = typeValidators.objectOf(typeValidators.number);

		objectOf({a:1, b:2});
		assert(!console.error.called);

		objectOf({a:'1', b:'2'});
		assert(console.error.called);
	});

	it('should validate a shape of an object', function() {
		var shape = typeValidators.shape({
			a: typeValidators.string,
			b: typeValidators.number
		});

		shape({a:'1', b:2});
		assert(!console.error.called);

		shape({a:'1', b:'2'});
		assert(console.error.called);
	});

	it('should validate a shape nested within a shape', function() {
		var shape = typeValidators.shape({
			a: typeValidators.shape({
				b: typeValidators.string
			})
		});

		shape({a: {b: 'test'}});
		assert(!console.error.called);

		shape({a: {b: 1}});
		assert(console.error.called);

		shape({a: 1});
		assert(console.error.called);
	});
});