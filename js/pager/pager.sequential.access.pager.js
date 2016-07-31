/**
 * @fileoverview
 *
 * This component is meant for items set where
 * pages are not fixed, that is the first element
 * of each page may change index within the array.
 * This prevents from moving randomly, but makes
 * possible to move sequentially by both single
 * item and page.
 *
 * The visual part is made up of fur buttons, to
 * move to previous and next item, and to previous
 * and next page, sort of rewind and fast forward.
 */

;(function(angular) {

angular.module('circMov')

.component('sequentialAccessPager', {
	controllerAs: 'model',
	templateUrl: '/util/html/sequential-access-pager.html',

	bindings: {
		currentItem: '<',
		pageLength: '<',
		itemsCount: '<',

		onItemChange: '&',
		onPageLengthChange: '&'
	},

	controller: ['CircularMovements', function(circMov) {

		/**
		 * @summary Returns true when items make
		 * up at least two pages.
		 *
		 * @return {boolean}
		 */
		this.isPaginable = function() {
			return this.itemsCount > this.pageLength;
		};

		/**
		 * @summary Moves the current page back by one, or
		 * alternatively, current item back by page length.
		 *
		 * @return {SequentialAccessPager} This instance.
		 */
		this.rewind = function() {
			this.currentItem = circMov.moveBackByMany(this.pageLength,
					this.currentItem, this.itemsCount);
			this.onItemChange({newItem: this.currentItem});
			return this;
		};

		/**
		 * @summary Moves the current item back by one.
		 *
		 * @return {SequentialAccessPager} This instance.
		 */
		this.prev = function() {
			this.currentItem = circMov.moveBackByOne(this.currentItem,
					this.itemsCount);
			this.onItemChange({newItem: this.currentItem});
			return this;
		};

		/**
		 * @summary Moves the current item forward by one.
		 *
		 * @return {SequentialAccessPager} This instance.
		 */
		this.next = function() {
			this.currentItem = circMov.moveForwardByOne(this.currentItem,
					this.itemsCount);
			this.onItemChange({newItem: this.currentItem});
			return this;
		};

		/**
		 * @summary Moves the current page forward by one, or
		 * alternatively, current item forward by page length.
		 *
		 * @return {SequentialAccessPager} This instance.
		 */
		this.fastForward = function() {
			this.currentItem = circMov.moveForwardByMany(this.pageLength,
					this.currentItem, this.itemsCount);
			this.onItemChange({newItem: this.currentItem});
			return this;
		};
	}]
});

})(angular);
