/**
 * @fileoverview
 *
 * This service defines useful methods to
 * manage circular array 0-based indexes,
 * such as incrementing and decrementing
 * size-wisely.
 */

;(function(angular) {

angular.module('pager')

.service('CircularMovements', function() {

	/**
	 * This method handles all the effective work:
	 * moves and index circularly, both forward
	 * and backward, given start position, offset
	 * and upper bound index.
	 *
	 * @summary Moves and index circularly.
	 *
	 * @private
	 * @memberof CircularMovements.
	 *
	 * @param {int} offset - How much start will be moved: can be both positive and negative.
	 * @param {int} start - Initial index position, that will be moved by offset positions.
	 * @param {int} upperBound - Upper bound value for returned index, can be thought as array length.
	 * @return {int} start index moved circularly by offset having as upper bound upperBound.
	 */
	var circularlyMove = function(offset, start, upperBound) {
		return (start + offset % upperBound + upperBound) % upperBound;
	};

	/**
	 * @summary Moves an index backward by the given offset,
	 * with upperBound as upper bound for returned index.
	 *
	 * @memberof CircularMovements.
	 *
	 * @param {int} currentItem - Initial index position, that will be moved by offset positions.
	 * @param {int} offset - How much currentItem will be moved backwards: must be positive in order to work properly.
	 * @param {int} upperBound - Upper bound value for returned index, can be thought as array length.
	 * @return {int} start index moved backward circularly by offset having as upper bound upperBound.
	 */
	this.moveBackByMany = function(offset, currentItem,
				upperBound) {
		return circularlyMove(-offset, currentItem,
				upperBound);
	};

	/**
	 * @summary Moves an index backward by one, with upperBound
	 * as upper bound for returned index.
	 *
	 * @memberof CircularMovements.
	 *
	 * @param {int} currentItem - Initial index position, that will be moved by offset positions.
	 * @param {int} upperBound - Upper bound value for returned index, can be thought as array length.
	 * @return {int} start index moved backward circularly by one having as upper bound upperBound.
	 */
	this.moveBackByOne = angular.bind(this, this.moveBackByMany, 1);

	/**
	 * @summary Moves an index forward by the given offset,
	 * with upperBound as upper bound for returned index.
	 *
	 * @memberof CircularMovements.
	 *
	 * @param {int} currentItem - Initial index position, that will be moved by offset positions.
	 * @param {int} offset - How much currentItem will be moved forward: must be positive in order to work properly.
	 * @param {int} upperBound - Upper bound value for returned index, can be thought as array length.
	 * @return {int} start index moved forward circularly by offset having as upper bound upperBound.
	 */
	this.moveForwardByMany = circularlyMove;

	/**
	 * @summary Moves an index forward by one, with upperBound
	 * as upper bound for returned index.
	 *
	 * @memberof CircularMovements.
	 *
	 * @param {int} currentItem - Initial index position, that will be moved by offset positions.
	 * @param {int} upperBound - Upper bound value for returned index, can be thought as array length.
	 * @return {int} start index moved forward circularly by one having as upper bound upperBound.
	 */
	this.moveForwardByOne = angular.bind(this, this.moveForwardByMany, 1);

	/**
	 * @summary Sets the index circularly.
	 *
	 * @memberof CircularMovements.
	 *
	 * @param {int} position - Desired value for index: will wrap if too large.
	 * @param {int} upperBound - Upper bound value for returned index, can be thought as array length.
	 * @return {int} The index value, unchanged if small enough, wrapped if too large.
	 */
	this.setPosition = function(position, upperBound) {
		return circularlyMove(position, 0, upperBound);
	};
});

})(angular);
