/*global Utils */

/**
 * @module MultimediaPlayerApplication
 */

/**
 * This class provides basic methods to operate with media content carousel (carouFredSel) like load and fill carousel with supplied audio content, scroll carousel to a given position, get current carousel position.
 * Media content carousel represents a playlist of audio tracks and allows user to browse tracks by swiping to left (next track) or right (previous track). Each carousel's item contains thumbnail, artist name and title.
 *
 * @class Carousel
 * @constructor
 */
var Carousel = function() {
	"use strict";
	this.initializeSwipe();
};
/**
* This property holds audio media content array that carousel is filled with.
* @property callHistory {Array}
* @default []
*/
Carousel.prototype.allMediaContent = [];
/**
* This property holds carouFredSel object for internal use in carousel.
* @property swipe {Object}
* @private
*/
Carousel.prototype.swipe = null;
/**
* This property holds callback function which is called after current element/position in carousel is changed.
* @property indexChangeCallback {Object}
* @private
*/
Carousel.prototype.indexChangeCallback = null;
/**
 * This method adds listener that will be called right after the carousel finished scrolling and current element/position is changed.
 *
 * @method addIndexChangeListener
 * @param indexChangeCallback {function()} Callback function to be invoked when current element/position of carousel is changed.
 */
Carousel.prototype.addIndexChangeListener = function(indexChangeCallback) {
	"use strict";

	this.indexChangeCallback = indexChangeCallback;
};

/**
 * Initializes and configures carouFredSel carousel object.
 *
 * @method initializeSwipe
 * @private
 */
 Carousel.prototype.initializeSwipe = function() {
	"use strict";

	var self = this;
	if (!this.swipe) {
		this.swipe = $('#carouselList').carouFredSel({
			auto : false,
			circular : false,
			infinite : false,
			width : 765,
			items : {
				visible : 3
			},
			swipe : {
				items : 1,
				duration : 150,
				onMouse : true,
				onTouch : true
			},
			scroll : {
				items : 1,
				duration : 150,
				onAfter : function(data) {
					if (!!self.indexChangeCallback) {
						self.indexChangeCallback(self.getCurrentPosition());
					}
				}
			}
		});
		if (!this.swipe.length) {
			this.swipe = null;
		}
	}
};

/**
 * Gets the position of selected carousel item.
 *
 * @method getCurrentPosition
 */
Carousel.prototype.getCurrentPosition = function() {
	"use strict";
	var self = this;
	if (!!self.swipe) {
		var pos = parseInt(self.swipe.triggerHandler("currentPosition"), 10);
		return pos;
	}
	return null;
};

/**
 * Scrolls the carousel to given index.
 *
 * @method slideTo
 * @param index {Integer} New position to be scrolled to.
 */
Carousel.prototype.slideTo = function(index) {
	"use strict";
	if (!!this.swipe && index >= 0 && index < this.allMediaContent.length) {
		this.swipe.trigger("slideTo", index);
	}
};
/**
 * This method fills carousel with audio media content and scrolls immediately the carousel to the designated position.
 *
 * @method loadMediaContent
 * @param  allMediaContent {Array} Audio media content array to be filled in the carousel.
 * @param  index {Integer} Position to be scrolled to.
 */
Carousel.prototype.loadMediaContent = function(allMediaContent, index) {
	"use strict";
	this.removeAllItems();
	this.allMediaContent = allMediaContent;
	this.insertPagesToSwipe();
	if (index >= 0 && index < this.allMediaContent.length && !!this.swipe) {
		this.swipe.trigger("slideTo", [ index, 0, {
			duration : 0
		} ]);
	}
};

/**
 * Creates an HTML snippet representing one carousel item to be inserted into the carousel.
 *
 * @method createSwipeItem
 * @param  mediaItem {Object} Object representing audio media item's information.
 * @param  index {Integer} Position of item in carousel used to identify supplied audio media item's HTML DOM representation.
 * @return {Object} jQuery DOM object representation of audio media item.
 * @private
 */
Carousel.prototype.createSwipeItem = function(mediaItem, index) {
	"use strict";

	if (!!mediaItem) {
		var carouselItem;
		var thumbnail = Utils.getThumbnailPath(mediaItem);
		var artist = Utils.getArtistName(mediaItem);
		var album = Utils.getAlbumName(mediaItem);
		var title = Utils.getMediaItemTitle(mediaItem);

		carouselItem = '<li><div id="item_' + index + '" class="carouselItem">';
		carouselItem += '<img class="carouselImage albumThumbnail carouselImageReflect" src="' + thumbnail + '" alt="">';
		carouselItem += '<div class="albumCarouselDescription">';
		carouselItem += '<div class="albumCarouselDescriptionText oneLineEllipsis fontColorNormal fontSizeLarge fontWeightBold">' + artist + '</div>';
		carouselItem += '<div class="albumCarouselDescriptionText twoLinesEllipsis fontColorDimmedLight fontSizeXSmall fontWeightBold">' + title + '</div>';
		carouselItem += '</div>';
		carouselItem += '</div></li>';

		carouselItem = $(carouselItem);
		return carouselItem;
	}

	return null;
};

/**
 * Inserts new carousel item into carousel.
 *
 * @method insertPagesToSwipe
 * @private
 */
Carousel.prototype.insertPagesToSwipe = function() {
	"use strict";
	var self = this;
	var carouselItem;
	var clickHandler = function() {
		self.swipe.trigger("slideTo", [ $(this), -1 ]);
	};

	for ( var index = this.allMediaContent.length - 1; index >= 0; --index) {
		carouselItem = this.createSwipeItem(this.allMediaContent[index], index);
		if (!!carouselItem && !!this.swipe) {
			this.swipe.trigger("insertItem", [ carouselItem, 0 ]);
			carouselItem.click(clickHandler);
		}
	}
	this.addCarouselEdges();
};

/**
 * Removes all items from the carousel.
 *
 * @method removeAllItems
 */
Carousel.prototype.removeAllItems = function() {
	"use strict";
	var carouselItem;

	if (!!this.swipe) {
		for ( var index = this.allMediaContent.length + 1; index >= 0; --index) {
			this.swipe.trigger("removeItem", index);
		}
	}
};

/**
 * Adds emty carousel items to the beginning and the end of the carousel
 * (to make sure first and last visible items appear in the middle of screen instead of at the edges when swiped to edges of carousel).
 * @method addCarouselEdges
 */
Carousel.prototype.addCarouselEdges = function() {
	"use strict";
	if (!!this.swipe) {
		var html = "<li><div class='carouselItem'></div></li>";
		this.swipe.trigger("insertItem", [ html, 0 ]);
		this.swipe.trigger("insertItem", [ html, "end", true ]);
	}
};
