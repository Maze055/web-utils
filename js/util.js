/**
 * @fileoverview
 * 
 * This file defines some utility functions, both glibal and
 * as methods of built-in objects.
 * <ul>
 *		<li>Array#allEqualTo()</li>
 *		<li>Object#allEqualTo()</li>
 *	</ul>
 */

(function() {

/**
 * @callback checkEquality
 * 
 * @summary Checks whether the arguments are equal.
 * 
 * @param {*} x - First argument.
 * @param {*} y - Second argument.
 * @return {boolean} True if arguments should be considered equal.
 */

/**
 * @ignore
 * 
 * @alias allEqualTo
 * @summary Checks if all elements are equal to the passed one.
 * 
 * @param {*} value - The value all elements are checked against.
 * @param {checkEquality} [equals=== operator] - Callback used to check for equality of value against every element.
 * @return {boolean} True if all elements are equal to value.
 */
var allEqualTo = function(value, equals) {
	equals = equals || function(x, y) { return x == y; };
	
	for (var k in this)
		if (!equals(value, this[k]))
			return false;
	return true;
};

/**
 * @summary Checks if all elements are equal to the passed one.
 * 
 * @memberof Array
 * @instance
 * @method allEqualTo
 * 
 * @param {*} value - The value all elements are checked against.
 * @param {checkEquality} [equals=== operator] - Callback used to check for equality of value against every element.
 * @return {boolean} True if all elements are equal to value.
 */
Object.defineProperty(Array.prototype, 'allEqualTo', {value: allEqualTo});

/**
 * @summary Checks if all elements are equal to the passed one.
 * 
 * @memberof Object
 * @instance
 * @method allEqualTo
 * 
 * @param {*} value - The value all elements are checked against.
 * @param {checkEquality} [equals=== operator] - Callback used to check for equality of value against every element.
 * @return {boolean} True if all elements are equal to value.
 */
Object.defineProperty(Object.prototype, 'allEqualTo', {value: allEqualTo});

})();
