/**
 * @fileoverview
 *
 * This is the Javascript part of the default settings used for Pagination.js.
 * The initialization object uses three divs (defined in pagination-defaults.html)
 * as containers, and displays a tooltip with a given error message when the page
 * is invalid. Such tooltip is powered by {@link https://iamceege.github.io/tooltipster/ tooltipster},
 * which is therefore initialized on the page element with the following options:
 * <code><pre>{
	animation: 'swing',
	autoClose: 'false',
	contentAsHTML: true,
	trigger: 'custom',
	updateAnimation: false
}</pre></code>
 */

var paginationDefaults;

;(function($) {

$(function() {

var paginationContainers = $('.pagination > div');
var prev = paginationContainers.eq(0);
var page = paginationContainers.eq(1);
var next = paginationContainers.eq(2);
var submit = $('[type="submit"]');

/**
 * This function returns an object for Pagination.js constructor.
 * Containers are found in pagination-default.html, and function
 * for valid and invalid page use tooltipster to display the
 * provided error message.
 *
 * @summary Returns an object for Pagination.js constructor.
 *
 * @global
 *
 * @param {string} errorMsg - The error message the tooltip will display.
 * @return {object} Initialization object for Pagination.js.
 */
paginationDefaults = function(errorMsg) {
	return {
		next: next,
		prev: prev,
		page: page,
		pageLength: 10,

		invalidPage: function() {
			page.tooltipster('content', errorMsg);
			page.tooltipster('show');
			submit.prop('disabled', true);
		},

		validPage: function() {
			page.tooltipster('hide');
			submit.prop('disabled', false);
		}
	};
};

// Tooltipster initialization on page element

page.tooltipster({
	animation: 'swing',
	autoClose: 'false',
	contentAsHTML: true,
	trigger: 'custom',
	updateAnimation: false
});

submit.prop('disabled', false);

});

})(jQuery);
