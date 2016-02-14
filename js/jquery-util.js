/**
 * @fileoverview
 * 
 * This file defines some utility methods, adding them
 * to {@link https://api.jquery.com/jQuery/ jQuery class}.
 * <ul>
 *		<li>intVal()</li>
 *		<li>activeCtrls()</li>
 *		<li>getterSetter()</li>
 * </ul>
 */

(function($) {

/**
 * Returns the integer value of the specified property,
 * or, if none was, the value itself as an integer.
 * 
 * @summary Returns the integer value of a property or the value itself.
 * 
 * @alias jQuery#intVal
 * 
 * @param {(integer|string)} prop - Index of the property.
 * @return {integer} Integer value of the property having index prop.
 */
$.fn.intVal = function(prop) {
	if (prop)
		return parseInt(this.prop(prop));
	return parseInt(this.val());
};

/**
 * Returns an object having as key-value pairs names and values
 * of enabled controls in the set. It optionally adds provided
 * key-value pairs to the result: provided keys overwrite result
 * ones.
 * 
 * @summary Returns an object of name-value pairs for enabled controls in the set.
 * 
 * @alias jQuery#activeCtrls
 * 
 * @param {object} [pairs] - Object containing key-value pairs to add to the result.
 * @return {object} Object containing name and values of active controls in the set.
 */
$.fn.activeCtrls = function(pairs) {
	var params = {};

	this.filter(':enabled:checked, :enabled:not(input[type="checkbox"],\
			input[type="radio"])').each(function() {
		params[this.name] = $(this).val();
	});

	return this.extend(params, pairs);
};

/**
 * Prototype of the typical jQuery-style property accessor:
 * if a value is provided, then it acts as a setter and
 * returns the jQuery instance; if only property name is
 * given, it acts as a getter and returns the value of
 * the property.
 * 
 * @summary Gets the value of a property or sets it if one is passed.
 * 
 * @alias jQuery#getterSetter
 * 
 * @param {(integer|string)} prop - Index of the property to act with.
 * @param {*} [value] - The value the property will be set to.
 * @return {(jQuery|*)} This jQuery instance when used as setter, the property value when used as getter.
 */
$.fn.getterSetter = function(prop, value) {
	if (arguments.length > 1) {
		this[prop] = value;
		return this;
	}
	
	return this[prop];
};

})(jQuery);
