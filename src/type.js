'use strict';

import { core } from 'metal';

const validators = {
	any: () => true,
	array: validateType('array'),
	bool: validateType('boolean'),
	func: validateType('function'),
	number: validateType('number'),
	object: validateType('object'),
	string: validateType('string'),

	arrayOf: (validator) => {
		return composeValidator(
			arrayOfValidatorFactory,
			validator
		);
	},
	instanceOf: (expectedClass) => {
		return composeValidator(
			instanceOfValidatorFactory,
			expectedClass
		);
	},
	objectOf: (validator) => {
		return composeValidator(
			objectOfValidatorFactory,
			validator
		);
	},
	oneOfType: (arrayOfTypeValidators) => {
		return composeValidator(
			oneOfTypeValidatorFactory,
			arrayOfTypeValidators
		);
	},
	shape: (shape) => {
		return composeValidator(
			shapeValidatorFactory,
			shape
		);
	}
};

/**
 * Creates a validator that checks the values of an array against a type.
 * @param {!function} validator Type validator to check each index against.
 * @param {boolean} noWarn Determines whether warnings should be emitted.
 * @return {function} Validator.
 */
function arrayOfValidatorFactory(validator, noWarn) {
	return (value, name, context) => {
		if (!Array.isArray(value)) {
			return warning('Expected an array.', name, context, noWarn);
		} else {
			const testArray = value.every(
				item => {
					return validator.noWarn(item, name);
				}
			);

			if (!testArray) {
				return warning('Expected an array of single type', name, context, noWarn);
			}
		}

		return true;
	};
}

/**
 * Creates two functions, one that emits warnings and one that does not.
 * @param {!function} validatorFactory Function that creates a validator.
 * @param factoryArg Argument that is passed to the factory.
 * @return {function} Validator.
 */
function composeValidator(validatorFactory, factoryArg) {
	const validator = validatorFactory(factoryArg);
	validator.noWarn = validatorFactory(factoryArg, true);

	return validator;
}

/**
 * Emits a warning to the console.
 * @param {!string} error Error message to display to console.
 * @param {string} name Name of state property that is giving the error.
 * @param {object} context.
 */
function emitWarning(error, name, context) {
	const componentName = context ? core.getFunctionName(context) : null;
	const parentComponent = context && context.getRenderer ? context.getRenderer().lastParentComponent_ : null;
	const parentComponentName = parentComponent ? core.getFunctionName(parentComponent) : null;

	const location = parentComponentName ? `Check render method of '${parentComponentName}'.` : '';

	console.error(`Warning: Invalid state passed to '${name}'. ${error} Passed to '${componentName}'. ${location}`);
}

/**
 * Checks type of given value.
 * @param value Any value.
 * @return {string} Type of value.
 */
function getStateType(value) {
	const stateType = typeof value;
	if (Array.isArray(value)) {
		return 'array';
	}

	return stateType;
}

/**
 * Creates a validator that compares a value to a specific class.
 * @param {!function} expectedClass Class to check value against.
 * @param {boolean} noWarn Determines whether warnings should be emitted.
 * @return {function} Validator.
 */
function instanceOfValidatorFactory(expectedClass, noWarn) {
	return (value, name, context) => {
		if (!(value instanceof expectedClass)) {
			return warning(`Expected instance of ${expectedClass}`, name, context, noWarn);
		}

		return true;
	};
}

/**
 * Creates a validator that checks the values of an object against a type.
 * @param {!function} typeValidator Validator to check value against.
 * @param {boolean} noWarn Determines whether warnings should be emitted.
 * @return {function} Validator.
 */
function objectOfValidatorFactory(typeValidator, noWarn) {
	return (value, name, context) => {
		let success = true;

		for (let key in value) {
			success = typeValidator.noWarn(value[key], null);
		}

		if (!success) {
			return warning('Expected object of one type', name, context, noWarn);
		}

		return true;
	};
}

/**
 * Creates a validator that checks a value against multiple types and only has to pass one.
 * @param {!array} arrayOfTypeValidators Array of validators to check value against.
 * @param {boolean} noWarn Determines whether warnings should be emitted.
 * @return {function} Validator.
 */
function oneOfTypeValidatorFactory(arrayOfTypeValidators, noWarn) {
	if (!Array.isArray(arrayOfTypeValidators)) {
		warning('Expected an array.', null, null, noWarn);
	}

	return (value, name, context) => {
		for (let i = 0; i < arrayOfTypeValidators.length; i++) {
			const validator = arrayOfTypeValidators[i];

			if (validator.noWarn(value, name)) {
				return true;
			}
		}

		return warning('Expected one of given types.', name, context, noWarn);
	};
}

/**
 * Creates a validator that checks against a specific primitive type.
 * @param {!string} expectedType Type to check against.
 * @param {boolean} noWarn Determines whether warnings should be emitted.
 * @return {function} Validator.
 */
function primitiveTypeValidatorFactory(expectedType, noWarn) {
	return (value, name, context) => {
		const type = getStateType(value);

		if (type !== expectedType) {
			return warning(`Expected type ${expectedType}`, name, context, noWarn);
		}

		return true;
	};
}

/**
 * Creates a validator that checks the shape of an object.
 * @param {!object} shape An object containing type validators for each key.
 * @param {boolean} noWarn Determines whether warnings should be emitted.
 * @return {function} Validator.
 */
function shapeValidatorFactory(shape, noWarn) {
	if (getStateType(shape) !== 'object') {
		warning(`Expected an object`, null, null, noWarn);
	}

	return (value, name, context) => {
		for (let key in shape) {
			const validator = shape[key];
			const valueForKey = value[key];

			if (valueForKey && !validator.noWarn(valueForKey, null)) {
				return warning('Expected object with a specific shape', name, context, noWarn);
			}
		}

		return true;
	};
}

/**
 * Creates a composed validator that checks against a certain type.
 * @param {!string} type Type to check against.
 * @return {function} A composed validator with both a warn and noWarn function.
 */
function validateType(type) {
	return composeValidator(
		primitiveTypeValidatorFactory,
		type
	);
}

/**
 * Determines what to return and when if a warning should be emitted.
 * @param {!string} message Error message to emit.
 * @param {string} name Name of state key.
 * @param {object} context.
 * @param {boolean} noWarn Determines whether emitWarning should be run.
 */
function warning(message, name, context, noWarn) {
	if (noWarn) {
		return null;
	} else {
		emitWarning(message, name, context);
	}

	return true;
}

export default validators;