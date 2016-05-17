'use strict';

const typeValidators = {
	any: () => true,
	array: emitWarning(createPrimitiveTypeValidator('array')),
	arrayOf: arrayType => emitWarning(createArrayTypeValidator(arrayType)),
	bool: emitWarning(createPrimitiveTypeValidator('boolean')),
	func: emitWarning(createPrimitiveTypeValidator('function')),
	instanceOf: instanceType => emitWarning(createInstanceTypeValidator(instanceType)),
	number: emitWarning(createPrimitiveTypeValidator('number')),
	object: emitWarning(createPrimitiveTypeValidator('object')),
	objectOf: expectedType => emitWarning(createObjectOfValidator(expectedType)),
	oneOfType: arrayOfTypeValidators => emitWarning(createUnionTypeValidator(arrayOfTypeValidators)),
	shape: shapeObject => emitWarning(createShapeTypeValidator(shapeObject)),
	string: emitWarning(createPrimitiveTypeValidator('string'))
};

/**
 * Validates an array where each value is the same type.
 * @param {!function} expectedType Type validator.
 * @return {function} Array validator.
 */
function createArrayTypeValidator(expectedType) {
	return (stateValue, stateName) => {
		if (!Array.isArray(stateValue)) {
			return new Error('Expected an array.');
		}

		const testArray = stateValue.every(
			item => {
				return expectedType(item, null, true) === null;
			}
		);

		if (!testArray) {
			return 'Expected an array of single type';
		}

		return null;
	}
}

/**
 * Validates the instance of a value against a specific class.
 * @param {!Object} expectedClass Class to check instance against.
 * @return {function} Type validator.
 */
function createInstanceTypeValidator(expectedClass) {
	return (stateValue, stateKey) => {
		if (!(stateValue instanceof expectedClass)) {
			return `Expected instance of ${expectedClass}`;
		}

		return null;
	}
}

/**
 * Validates each value in an object against a certain type.
 * @param {!function} expectedType Type validator.
 * @return {function} Object validator.
 */
function createObjectOfValidator(expectedType) {
	return (stateValue, stateKey) => {
		let success = true;

		for (let key in stateValue) {
			success = expectedType(stateValue[key], null, true) === null;
		}

		if (!success) {
			return 'Expected object of one type';
		}

		return null;
	}
}

/**
 * Validates an objects shape.
 * @param {!Object} shapeTypes An object containing type validators for each key.
 * @return {function} Shape validator.
 */
function createShapeTypeValidator(shapeTypes) {
	return (stateValue, stateKey) => {
		let success = true;

		for (let key in shapeTypes) {
			const validator = shapeTypes[key];

			if (!validator) {
				continue;
			}

			const stateValueForKey = stateValue[key];

			if (stateValueForKey) {
				const success = validator(stateValueForKey, null, true) === null;

				if (!success) {
					return 'Expected object with a specific shape';
				}
			}
		}

		return null;
	}
}

/**
 * Validates a specific primitive type.
 * @param {!string} expectedType Name of primitive type.
 * @return {function} Type validator.
 */
function createPrimitiveTypeValidator(expectedType) {
	return (stateValue, stateName) => {
		const stateType = getStateType(stateValue);

		if (stateType !== expectedType) {
			return `Expected type ${expectedType}`;
		}
		return null;
	}
}

/**
 * Validates if any of the type validators are successfull.
 * @param {!array} arrayOfTypeValidators Array of type validators.
 * @return {string|function} Type validator or error.
 */
function createUnionTypeValidator(arrayOfTypeValidators) {
	if (!Array.isArray(arrayOfTypeValidators)) {
		return 'Expected an array';
	}

	return (stateValue, stateName) => {
		for (var i = 0; i < arrayOfTypeValidators.length; i++) {
			var validator = arrayOfTypeValidators[i];

			if (validator(stateValue, stateName, true) == null) {
				return null;
			}
		}

		return 'Expected one of given types.';
	}
}

/**
 * Wrapper function that is used to determine if console.error should be thrown.
 * @param {!function} validator Type validator.
 * @return {function} This is the result function passed to the state validator.
 */
function emitWarning(validator) {
	function returnFn(stateValue, stateName, disableWarning) {
		const expectedError = validator(stateValue, stateName);

		if (!disableWarning && expectedError) {
			let componentName;
			let parentComponent;
			let parentComponentName;

			if (this) {
				componentName = this.constructor.name;
				parentComponent = this.getRenderer ? this.getRenderer().lastParentComponent_ : null;
				parentComponentName = parentComponent ? parentComponent.constructor.name : null;
			}

			console.error(
				`Warning: Invalid state '${stateName}' of type '${getStateType(stateValue)}' ` +
				`passed to '${componentName}'. ${expectedError}.  Check render method of ${parentComponentName}.`
			);
		}

		if (disableWarning && !expectedError) {
			return null
		}

		return true
	}

	return returnFn;
}

/**
 * Checks value type.
 * @param stateValue Any value.
 * @return {string}
 */
function getStateType(stateValue) {
	const stateType = typeof stateValue;
	if (Array.isArray(stateValue)) {
		return 'array';
	}

	return stateType;
}

export default typeValidators;