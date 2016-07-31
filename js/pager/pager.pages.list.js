/**
 * @fileoverview
 *
 * This filter creates an array containing
 * pages numbers, based on how many items
 * need to be paginated and page length.
 * For efficiency, also takes as input the
 * previously generated page numbers array.
 */

;(function(angular) {

angular.module('pager')

.filter('pagesList', function() {
	return function(input, itemsCount, pageLength) {

		/*
			Integer division remainder forms
			the last, not-always-full, page
		*/
		var newPagesCount = Math.ceil(itemsCount / pageLength);

		if (newPagesCount != input.length) {

			/*
				When the new pages are less than the
				current ones, a new set of items is
				going to be paginated, so a new page
				numbers array is created
			*/
			if (newPagesCount < input.length) {
				input = [1];
				var startPage = 1;
			}
			else {
				var startPage = input.length + 1;
			}

			for (var k = startPage; k <= newPagesCount; ++k)
				input.push(k);
		}

		return input;
	};
});

})(angular);
