/**
 * @class
 * 
 * @classdesc This class handles pagination, that is
 * managing a number input to show the page and two
 * buttons to go back and forward. By managing the
 * number input we mean that the content is checked
 * to be valid whenever it changes, calling either
 * args.validPage or args.invalidPage, and disabled
 * if it's not. Previous and next buttons make page
 * number decrease and advance by one respectively,
 * and are disabled when page number is one the
 * former and if it's equal to max property the latter.
 * 
 * @param {object} args - Wrapper for named parameters.
 * @param {(DOM|jQuery)} args.prev - Container for previous button.
 * @param {(DOM|jQuery)} args.page - Container for page number input.
 * @param {(DOM|jQuery)} args.next - Container for next button.
 * @param {integer} [args.pageLength=10] - Length of a page.
 * @param {function} [args.validPage] - Called when the page number is valid.
 * @param {function} [args.invalidPage] - Called when the page number is not valid.
 */
var Pagination = function(args) {

	// Ceating DOM Elments
	
	this.next = document.createElement('button');
	this.next.setAttribute('name', 'next');
	this.next.setAttribute('type', 'button');
	this.next.setAttribute('class', 'pagination-next');
	this.next.disabled = true;
	this.next.appendChild(document.createTextNode('\u2192'));

	this.prev = document.createElement('button');
	this.prev.setAttribute('name', 'prev');
	this.prev.setAttribute('type', 'button');
	this.prev.setAttribute('class', 'pagination-prev');
	this.prev.disabled = true;
	this.prev.appendChild(document.createTextNode('\u2190'));

	this.page = document.createElement('input');
	this.page.setAttribute('type', 'number');
	this.page.setAttribute('name', 'page');
	this.page.setAttribute('value', '1');
	this.page.setAttribute('min', '1');
	this.page.setAttribute('step', '1');
	this.page.setAttribute('class', 'pagination-page');
	this.page.disabled = true;
	
	// Checking whether jQuery is used for every object
	if (typeof(jQuery) != 'undefined') {	
		(args.next instanceof jQuery ? args.next[0] : args.next).appendChild(this.next);
		(args.prev instanceof jQuery ? args.prev[0] : args.prev).appendChild(this.prev);
		(args.page instanceof jQuery ? args.page[0] : args.page).appendChild(this.page);
	}
	else {
		args.next.appendChild(this.next);
		args.prev.appendChild(this.prev);
		args.page.appendChild(this.page);
	}
	
	/**
	 * Current length of a page. Can be assigned anytime.
	 * 
	 * @summary Current length of a page.
	 * 
	 * @type {integer}
	 */
	//This value is here for coherence, but it's meant to be used by class clients
	this.pageLength = args.pageLength || 10;

	/**
	 * Advises if the page has changed since last time
	 * it was reset (by simply assigning it): it's set
	 * automatically every time the page number changes
	 * value.
	 * 
	 * @summary Advises if the page has changed since last time
	 * it was reset.
	 * 
	 * @type {boolean}
	 */
	this.pageChanged = false;
	
	/*
		Utility function to trigger event on a dom element,
		using verbose syntax to be IE-compatible
	*/
	var trigger = function(eventType) {
		try {
			var event = new Event(eventType);
		} catch (oldStuff) {
			var event = document.createEvent('HTMLEvents');
			event.initEvent(eventType, true, true);
		}
		this.dispatchEvent(event);
	};

	this.prev.trigger = trigger;
	this.page.trigger = trigger;
	this.next.trigger = trigger;
	
	/*
		Utility method to get property values as integers;
		the default property, when none is specified, is 'value'
	*/
	this.page.asInt = function(prop) {
		return parseInt(this[prop || 'value']);
	};

	/*
		Page change event handler. Checks if the page number
		is valid (greater than 0 and less than max): if so calls
		args.validPage, if not calls args.invalidPage. Prev
		and next are disabled and enabled as needed
	*/
	this.page.isValid = (function() {
		var pageVal = this.page.asInt();
		
		// When max is not set, it must not influence results
		var pageMax = this.page.asInt('max') || pageVal + 1;
		
		if (!pageVal || pageVal < 1 || pageVal > pageMax) {
			this.prev.disabled = !pageVal || pageVal <= 1;
			this.next.disabled = !pageVal || pageVal >= pageMax;
			if (args.invalidPage)
				args.invalidPage();
			return false;
		}
		else {
			this.prev.disabled = pageVal == 1;
			this.next.disabled = pageVal == pageMax;
			this.pageChanged = true;
			if (args.validPage)
				args.validPage();
			return true;
		}
	}).bind(this);
	
	if (args.onlyCheckOnChange)
		this.page.addEventListener('change', this.page.isValid);
	
	// Next click event handler: advances page number by step property
	this.next.addEventListener( 'click', (function() {
		try {
			this.page.stepUp();
		} catch (oldStuff) {
			var next = this.page.asInt() + this.page.asInt('step');
			if ( next <= (this.page.asInt('max') || next) );
				this.page.value = next;
		}

		// Page value has changed, so triggering event
		this.page.trigger('change');
	}).bind(this) );

	// Prev click event handler: decreases page number by step prperty
	this.prev.addEventListener( 'click', (function() {		
		try {
			this.page.stepDown();
		} catch (oldStuff) {
			var prev = this.page.asInt() - this.page.asInt('step');
			if (prev >= 1);
				this.page.value = prev;
		}

		// Page value has changed, so triggering event
		this.page.trigger('change');			
	}).bind(this) );
};

/**
 * This method lets an event listener to be run after
 * page number has checked to be valid. This is because
 * some code, such as an ajax request, just shouldn't
 * execute when page is not valid, and using addEventListener()
 * or jQuery on() simply does the opposite, that is
 * execute code before page validity check. handler
 * callback can even be written like we're dealing
 * with jQuery objects and events, just set usejQuery
 * to true and be sure you previously loaded jQuery.
 * 
 * @summary Adds to the specified element an event listener that should be executed only if page content is valid.
 * 
 * @param {string} elem - The element to which attach the event listener.
 * @param {string} name - Name of the event to listen for.
 * @param {function} handler - Event handler that will run only if page number is valid.
 * @param {boolean} [usejQuery=false] - If set, will use jQuery to attach the event: beware, jQuery must be already loaded.
 */
Pagination.prototype.addPageCheckListener = function(elem, name, handler, usejQuery) {
	elem = usejQuery ? jQuery(this[elem]) : this[elem];
	handler = handler.bind(elem);
	var effectiveHandler = (function(event) {
		if (this.page.isValid())
			handler(event)
	}).bind(this);
	if (usejQuery)
		elem.on(name, effectiveHandler);
	else
		elem.addEventListener(name, effectiveHandler);
};

/**
 * This method adds an event handler to the specified element.
 * It is mainly useful to attach click listeners to next and
 * prev that should run after the click event provided by this
 * very class. handler callback can even be written like we're
 * dealing with jQuery objects and events, just set usejQuery
 * to true and be sure you previously loaded jQuery.
 * 
 * @summary Adds an event handler to the specified element.
 * 
 * @param {string} elem - The element to which attach the event listener.
 * @param {string} name - Name of the event to listen for.
 * @param {function} handler - Event handler that will run.
 * @param {boolean} [usejQuery=false] - If set, will use jQuery to attach the event: beware, jQuery must be already loaded.
 */
Pagination.prototype.addListener = function(elem, name, handler, usejQuery) {
	elem = usejQuery ? jQuery(this[elem]) : this[elem];
	handler = handler.bind(elem);
	if (name == 'click' && elem != 'page') {
		var effectiveHandler = (function(event) {
			this.trigger('click');
			handler(event);
		}).bind(this[elem]);
	}
	else {
		var effectiveHandler = handler;
	}
	if (usejQuery)
		elem.on(name, effectiveHandler);
	else
		elem.addEventListener(name, effectiveHandler);
};

/**
 * @summary Returns page number as an integer.
 * 
 * @return {integer} Current page number.
 */
Pagination.prototype.pageNumber = function() {
	return this.page.asInt();
};

/**
 * @summary Returns previous page button: use at your own risk!
 * 
 * @return {DOM} Previous page button.
 */
Pagination.prototype.getPrev = function() {
	return this.prev;	
};

/**
 * @summary Returns page number input: use at your own risk!
 * 
 * @return {DOM} Page number input.
 */
Pagination.prototype.getPage = function() {
	return this.page;	
};

/**
 * @summary Returns next page button: use at your own risk!
 * 
 * @return {DOM} Next page button.
 */
Pagination.prototype.getNext = function() {
	return this.next;	
};

/**
 * This method sets the state of the three DOM elements
 * to the first page: prev button disabled, page number
 * is one, next button enabled and max attribute removed
 * from page number input.
 * 
 * @summary Sets the state to first page.
 */
Pagination.prototype.first = function() {
	this.page.value = 1;
	this.page.removeAttribute('max');
	this.prev.disabled = true;
	this.page.disabled = false;
	this.next.disabled = false;
};

/**
 * This method sets the state of the three DOM elements
 * to the last page: prev button enabled, next button
 * disabled and max attribute set to current page value.
 * 
 * @summary Sets the state to last page.
 */
Pagination.prototype.last = function() {
	this.page.max = this.page.value;
	this.prev.disabled = false;
	this.page.disabled = false;
	this.next.disabled = true;
};

/**
 * This method sets the state of the three DOM elements
 * to the only page: all element disabled, page number
 * input value and max property set both to one.
 * 
 * @summary Sets the state to only page.
 */
Pagination.prototype.only = function() {
	this.page.value = 1;
	this.page.max = 1;
	this.prev.disabled = true;
	this.page.disabled = true;
	this.next.disabled = true;
};

/**
 * This method sets the state of the three DOM elements
 * to the given page: prev button disabled only if page
 * number is equal to one, page number set to pageVal
 * if provided, next button disabled only if page number
 * is equal to max property, if set.
 * 
 * @summary Sets the state to the given page.
 * 
 * @param {integer} [pageVal] - The value page number will be set to.
 */
Pagination.prototype.other = function(pageVal) {
	if (pageVal)
		this.page.value = pageVal;
	else
		pageVal = this.page.asInt();

	this.page.disabled = false;
	
	// When max is not set, it must not influence results
	this.next.disabled = pageVal == (this.page.asInt('max') || pageVal + 1);
	this.prev.disabled = pageVal == 1;
};
