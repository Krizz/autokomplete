;(function ($, window, document, undefined) {
	var pluginName = 'autokomplete',
		defaults = {
			propertyName: "value",
			source: function () {},
			complete: false,
			onChange: function () {},
			values: {},
			width: null
		};

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype.init = function () {
		var ENTER = 13;
		var UP = 38;
		var DOWN = 40;
		var BACKSPACE = 8;
		var timeout;
		var selected;
		var index = 0;
		var selected = [];
		var results_array = [];
		var options = this.options;
		var element = $(this.element)
		.hide()
		.after('<div class="autokomplete"><ul class="selected"><div class="input"><input autocomplete="off" type="text" value="" /><div class="value"></div></div></ul><ul class="results"></ul></div>')
		.next()
		.bind('click', function () {
			input.focus();
		});
		if (options.width) {
			element.css({
				width: options.width
			}).find('.results').css({
				width: options.width - 2
			})
		}
		var results_elem = element.find('.results');
		var change = function () {
				var values = [];
				var selected = element.find('.selected');
				$('li', selected).each(function () {
					values.push($(this).data());
				});
				options.onChange(values);
			};
		var populate = function (results) {
				index = 0;
				results_elem.empty();
				results_array = [];
				if (results.length !== 0) {
					results_elem.show();
					index = 0;
					for (var i = 0; i < results.length; i++) {
						if (selected.indexOf(results[i].id) === -1) {
							var elem = $('<li class="result">' + results[i].caption + '</li>').bind('click', function () {
								var index = $('li', results_elem).index($(this));
								add_selected(results_array.splice(index, 1));
								$(this).remove();
								change();
							});
							results_array.push(results[i]);
							if (i == 0) {
								elem.addClass('current');
							}
							results_elem.append(elem);
						}
					}
				} else {
					results_elem.append('<li>Nothing found...</li>');
				}
			}

		var add_selected = function add_to_selection(data) {
				if (!$.isArray(data)) {
					var elem = $('<li><p>' + data.caption + '</p></li>').data(data);
					input.val('').parent().before(elem);
					selected.push(data.id);
					results_elem.empty()
					change();
				} else {
					for (var i = 0; i < data.length; i++) {
						add_to_selection(data[i])
					}
				}
			}

		var input = element.find('input').autoGrowInput({
			comfortZone: 50,
			minWidth: 20,
			maxWidth: 500
		}).bind('keydown', function (e) {
			var val = $.trim(input.val());
			var data = input.data();
			switch (e.keyCode) {
				case 13:
					if(val) {
						add_selected(results_array[index]);
						results_array.splice(index, 1);
					}
					return false;
					break;
				case 38:
					//up
					index--;
					break;
				case 40:
					index++;
					//down
					break;
				case 8:
					if (!val) {
						input.parent().prev().remove();
						selected.pop();
						change();
					}
					break;
				default:
					break;
			}

			var result_count = results_array.length;
			if (index < 0) {
				index = result_count - 1;
			} else {
				index = index % result_count;
			}
			var elem = $('li.result:eq(' + index + ')', results_elem);
			$(results_elem).find('.current').removeClass('current');
			elem.addClass('current');

		}).bind('keyup', function (e) {
			var key = e.keyCode;
			if(key == ENTER || key == UP || key == DOWN) {
				return false;
			}
			var val = $.trim($(this).val());
			clearTimeout(timeout);
			timeout = setTimeout(function () {
					options.source(val, function (results) {
						console.log(results);
						populate(results);
					});
			}, 200);
			return false;
		});

		add_selected(options.values);
	};

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	}

})(jQuery, window, document);