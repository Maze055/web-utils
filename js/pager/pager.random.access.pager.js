/**
 * @fileoverview
 *
 * This component is meant for items set where
 * pages are fixed, that is the first element of
 * each page has always the same index within the
 * array. This makes possible to jump randomly
 * among pages, not just back and forward the
 * current one.
 *
 * The visual part is made up of two buttons, to
 * move to previous and next page, and a drop
 * down menu, to randomly choose a page
 */

;(function(angular) {

angular.module('pager')

.component('randomAccessPager', {
	controllerAs: 'model',
	templateUrl: '/util/html/random-access-pager.html',

	bindings: {
		currentPage: '<',
		pageLength: '<',
		pagesCount: '<',

		onPageChange: '&',
		onPageLengthChange: '&'
	},

	controller: ['CircularMovements', 'pagesListFilter',
			function(circMov, makePagesList) {

		this.pages = [];	// Page numbers

		/**
		 * @summary Returns true when items make
		 * up at least two pages.
		 *
		 * @return {boolean}
		 */
		this.isPaginable = function() {
			return this.pagesCount > this.pageLength;
		};

		/**
		 * @summary Creates the page numbers array.
		 *
		 * @return {int[]}
		 */
		this.makePagesList = function() {
			return this.pages = makePagesList(this.pages,
					this.pagesCount, this.pageLength);
		};
		this.makePagesList(); // Pages numers array initialization

		/**
		 * @summary Moves the current page back by one.
		 *
		 * @return {RandomAccessPager} This instance.
		 */
		this.prev = function() {

			/*
				Increment and decremente are needed
				due to currentPage being 1-based
			*/
			this.currentPage = circMov.moveBackByOne(this.currentPage - 1,
					this.pages.length) + 1;
			this.onItemChange({newPage: this.currentPage});
			return this;
		};

		/**
		 * @summary Moves the current page forward by one.
		 *
		 * @return {RandomAccessPager} This instance.
		 */
		this.nextPage = function() {

			/*
				Increment and decremente are needed
				due to currentPage being 1-based
			*/
			this.currentPage = circMov.moveForwardByOne(this.currentPage - 1,
					this.pages.length) + 1;
			this.onItemChange({newPage: this.currentPage});
			return this;
		};
	}]
});

})(angular);
