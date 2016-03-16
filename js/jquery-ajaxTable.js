(function($) {

/**
 * This callback is used to build new rows when AJAX
 * data are fetched. Note that it has no return value,
 * so you must do anything you need to update table
 * content by yourself.
 *
 * @summary Called when AJAX data are available to build new rows.
 *
 * @callback rowsFactory
 * @memberof jQuery-AjaxTable.
 *
 * @param {jQuery} table - The table object jQuery-Ajaxtable was initialized on.
 * @param {*} data - Data returned by AJAX call.
 */

$.fn.ajaxTable = function() {

	/**
	 * @class jQuery-AjaxTable
	 * @classdesc This is a jQuery plugin that builds rows for
	 * a table fetching AJAX data, optionally splitting rows
	 * into pages. The key feature is that you must supply your
	 * callback to build rows: therefore, you have full control
	 * over content creation. This plugin uses the typical jQuery
	 * plugin API: a class wrapped into a single method of jQuery
	 * objects, and methods passed on as strings in the first
	 * argument, apart from the constructor that takes an object
	 * as first and only parameter. Throughout the documentation
	 * it will be thus referred to as a class, but it's actually
	 * a method: hence, there will be exapmes everywhere.
	 *
	 * @param {object} args - Wrapper for named parameters.
	 * @param {string} args.url - Url for all subsequent AJAX requests.
	 * @param {object} [args.ajax] - A {@link https://api.jquery.com/jQuery.ajax/#jQuery-ajax-settings jQuery Ajax settings} plain object, that will be used for all subsequent requests. The default value is that of {@link https://api.jquery.com/jQuery.getJSON/ $.getJSON()}, that is a GET request returning JSON data; any url property will overwrite the one provided directly within args.
	 * @param {jQuery-AjaxTable.rowsFactory} args.makeRows - Callback used to create rows every time new data are avaliable.
	 * @param {boolean} [args.autoEmpty=true] - If set, all the rows are dropped before updating.
	 * @param {object} [args.pagination] - When provided, it will be used to construct a {@link Pagination} object, meaning that rows will be paginated.
	 * @param {boolean} [args.resetPage=false] - Initial value for reserPage property.
	 *
	 * @example myTable.ajaxTable({
	 *	url: 'http://my.example.url/myScript.php',
	 *	ajax: {dataType: 'xml'},
	 *	rowsFactory: myCallback,
	 *	pagination: {
	 *		prev: $('#prev'),
	 *		page: $('#page'),
	 *		next: $('#next')
	 *	}
	 * });
	 */
	if (typeof(arguments[0]) == 'object') {
		var params = arguments[0];

		/*
			If a table is supplied, the first row must
			not be removed since it's the heading
		*/
		switch (this.prop('tagName').toLowerCase()) {
			case 'table':
				this.emptyFunction = function() { this.find('tr:gt(0)').remove(); };
				break;

			case 'tbody':
				this.emptyFunction = this.empty;
				break;

			default:
				console.log('ajaxTable can obly be applied to tables and tbodies');
				return;
		}

		this.initialized = true;

		// Here url property in params.ajax overwrites that in params
		this.ajaxSettings = this.extend({url: params.url, dataType: 'json'}, params.ajax);

		this.makeRows = params.makeRows;
		this.autoEmpty = params.autoEmpty || true;
		if (params.pagination) {
			this.pagination = new Pagination(params.pagination);
			this.resetPage = params.resetPage || false;
		}

		return this;
	}

	else if (!this.initialized) {
		console.log('ajaxTable is not initialized');
	}

	/**
	 * When {@link Pagination} is set, any of its methods
	 * can be called with jQuery-AjaxTable API: the method
	 * name as the first argument and possible parameters
	 * following.
	 *
	 * @name jQuery-AjaxTable#Pagination
	 * @method
	 *
	 * @example myTable.ajaxTable('last');
	 * @example myTable.ajaxTable('addPageCheckListener', 'page', 'change', function() {
	 *	console.log('Page value changed correctly');
	 * });
	 */
	else if (this.pagination && Pagination.prototype[arguments[0]]) {
		var method = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		return Pagination.prototype[method].apply(this.pagination, args);
	}

	/**
	 * This method performs an AJAX request, using url and
	 * ajax parameters given once and for all at the
	 * initialization, and updates table content calling
	 * makeRows when the response is available. If {@link
	 * Pagination} is enabled, current page number and
	 * pages length are got from the instance within this
	 * class, and added to params at properties 'page' and
	 * 'pageLength'; also, if the response is neither an Object
	 * nor an Array, it's considered as a one-element page.
	 * If {@link jQuery-AjaxTable#autoEmpty autoEmpty} is
	 * set, the table will be cleared before calling makeRows.
	 *
	 * @summary Performs an AJAX request and updates the
	 * table using the response.
	 *
	 * @name jQuery-AjaxTable#submit
	 * @method
	 *
	 * @param {string} params - Standard URL-encoded string of parameters sent to the server script. Note that if Pagination is enabled, 'page' and 'pageLength' are added automatically.
	 * @return {jQuery} This jQuery instance.
	 *
	 * @example myTable.ajaxTable('submit', {request: 'myRequest', id: 7});
	 */
	else switch (arguments[0]) {
		case 'submit':
			var params = arguments[1];

			if (this.pagination) {
				params += '&page=';
				if (this.pagination.pageChanged)
					params += this.pagination.pageNumber();
				else
					params += '1';
				this.pagination.pageChanged = false;

				params += '&pageLength=' + this.pagination.pageLength;
			}

			$.ajax( this.extend({data: params, success: (function(data) {
					if (this.autoEmpty)
						this.emptyFunction();

					this.makeRows(this, data);

					if (this.pagination) {
						if (typeof(data) != 'object' && typeof(data) != 'array')
							this.pagination[params.page == 1 ? 'only' : 'last']();
						else
							if (params.page == 1)
								this.pagination[data.length < this.pagination.pageLength
									? 'only' : 'first']();
						else
							this.pagination[data.length < this.pagination.pageLength
									? 'last' : 'other'](params.page);
					}
				}).bind(this)}, this.ajaxSettings) );

			return this;

		/**
		 * This method returns the value of {@link Pagination#pageLength pageLength}
		 * property of Pagination instance within this class when called
		 * with no argument, otherwise sets it to the one provided and
		 * returns this {@link jQuery} instance. Obviously, won't work
		 * when pagination is not set.
		 *
		 * @summary Gets or sets {@link Pagination#pageLength pageLength}
		 * property of this class Pagination instance.
		 *
		 * @name jQuery-AjaxTable#pageLength
		 * @method
		 *
		 * @param {integer} [length] - The value pageLength property will be set to, if provided.
		 * @return {(integer|jQuery)} pageLength property value when getting, this jQuery instance when setting.
		 *
		 * @example myTable.ajaxTable('pageLength', 20);
		 */
		case 'pageLength':

		/**
		 * This method returns the value of {@link Pagination#pageChanged pageChanged}
		 * property of Pagination instance within this class when called
		 * with no argument, otherwise sets it to the one provided and
		 * returns this {@link jQuery} instance. Obviously, won't work
		 * when pagination is not set.
		 *
		 * @summary Gets or sets {@link Pagination#pageChanged pageChanged}
		 * property of this class Pagination instance.
		 *
		 * @name jQuery-AjaxTable#pageChanged
		 * @method
		 *
		 * @param {boolean} [changed] - The value pageChanged property will be set to, if provided.
		 * @return {(boolean|jQuery)} pageChanged property value when getting, this jQuery instance when setting.
		 *
		 * @example myTable.ajaxTable('pageChanged', false);
		 */
		case 'pageChanged':
			if (this.pagination)
				return this.getterSetter.apply(this.pagination, arguments);
			else
				console.log('Pagination not set');
			break;

		/**
		 * This method returns the value of resetPage property when called
		 * with no argument, otherwise sets it to the one provided and returns
		 * this {@link jQuery} instance. Obviously, won't work
		 * when pagination is not set.
		 *
		 * @summary Gets or sets resetPage property.
		 *
		 * @name jQuery-AjaxTable#resetPage
		 * @method
		 *
		 * @param {boolean} [reset] - The value resetPage property will be set to, if provided.
		 * @return {(boolean|jQuery)} resetPage property value when getting, this jQuery instance when setting.
		 *
		 * @example myTable.ajaxTable('resetPage', true);
		 */
		case 'resetPage':
			if (this.pagination)
				return this.getterSetter(arguments[0], arguments[1]);
			else
				console.log('Pagination not set');
			break;

		/**
		 * This method returns the value of autoEmpty property when called
		 * with no argument, otherwise sets it to the one provided and returns
		 * this {@link jQuery} instance.
		 *
		 * @summary Gets or sets autoEmpty property.
		 *
		 * @name jQuery-AjaxTable#autoEmpty
		 * @method
		 *
		 * @param {boolean} [reset] - The value autoEmpty property will be set to, if provided.
		 * @return {(boolean|jQuery)} autoEmpty property value when getting, this jQuery instance when setting.
		 *
		 * @example myTable.ajaxTable('autoEmpty', false);
		 */
		case 'autoEmpty':
			return this.getterSetter(arguments[0], arguments[1]);

		// Specified method does not exist
		default:
			console.log("'" + arguments[0] + "': No such method");
			break;
	}
};

})(jQuery);
