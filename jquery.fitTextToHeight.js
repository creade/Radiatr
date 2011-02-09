/*
jQuery Fit Text to Height plugin
Version 0.1
Author: Mike Brant
*/
$.fn.fitTextToHeight = function(options) {
	options = $.extend({}, $.fn.fitTextToHeight.defaults, options);

	return this.each(function() {
		element = $(this);
		
		// we determine if this is the first time this method has been executed on this element
		if (element.data('initStateSet') == undefined) {
			// read in element's initial state into jQuery data
			var heightInit = element.height();
			element.data('heightInit', heightInit);
			var overflowInit = element.css('overflow');
			element.data('overflowInit', overflowInit);
			var fontSizeInit = parseInt(element.css('font-size').replace('px', ''));
			element.data('fontSizeInit', fontSizeInit);
			var topMarginInit = parseInt(element.css('margin-top').replace('px', ''));
			element.data('topMarginInit', topMarginInit);
			element.data('initStateSet', true);
		} else {
			// reset the element's css to its initial state
			var heightInit = element.data('heightInit');
			element.css('height', heightInit);
			var overflowInit = element.data('overflowInit');
			element.css('overflow', overflowInit);			
			var fontSizeInit = element.data('fontSizeInit');
			element.css('font-size', fontSizeInit+'px');
			var topMarginInit = element.data('topMarginInit');
			element.data('topMarginInit', topMarginInit);
		}

		var maxScrollHeight = options.maxScrollHeight;	
		// if the maxScrollHeight is set to zero, we try to fix text into the CSS-defined height of the element
		if (options.maxScrollHeight == 0) {
			maxScrollHeight = heightInit;
		}
		
		// set overflow to auto. This is needed in order to be able to calculate the scrollHeight correctly (if overflow is set to hidden this will not work). We will set the element overflow back to initial value once resize is complete.
		element.css('overflow', 'auto');

		var scrollHeightInit = element.get(0).scrollHeight;
		var scrollHeight = scrollHeightInit;
		var fontSize = fontSizeInit;
		
		// change text size to fit vertically within the defined maxScrollHeight
		while (scrollHeight > maxScrollHeight) {
			fontSize = fontSize - options.fontAdjustIncrement;
			element.css('font-size', fontSize+'px');
			scrollHeight = element.get(0).scrollHeight;
		}
		
		while (scrollHeight < maxScrollHeight) {
			fontSize = fontSize + options.fontAdjustIncrement;
			element.css('font-size', fontSize+'px');
			scrollHeight = element.get(0).scrollHeight;
		}
		
		// if text is to be vertically centered and the text is not set to fit to the initial CSS-defined height, we need to shift the location of the element to make it appear verticaly centered. We do this be modifying the top-margin css property.
		if (options.verticallyCentered == true && options.maxScrollHeight != 0 && scrollHeightInit != scrollHeight) {
			var parentScrollHeight = element.parent().get(0).scrollHeight;
			var centerInit = (parentScrollHeight - heightInit)/2;
			var centerNew = (parentScrollHeight - scrollHeight)/2;
			var topMargin = centerNew - centerInit + topMarginInit;
			element.css('height', scrollHeight+'px');
			element.css('position', 'relative');
			element.css('top', topMargin+'px'); 
		}
		
		// change overflow style back to original state
		element.css('overflow', overflowInit);
	})
}
$.fn.fitTextToHeight.defaults = {
	verticallyCentered: true,
	maxScrollHeight: 0,
	fontAdjustIncrement: 1
}