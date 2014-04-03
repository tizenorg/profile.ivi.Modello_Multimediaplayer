/**
 * @module MultimediaPlayerApplication
 */

/**
 * Utility class with helper methods for Multimedia player.
 *
 * @class Utils
 */
var Utils = {
	/**
	 * Provides default thumbnails for given media types.
	 *
	 * @method getDefaultThumbnailByType
	 * @param type {String} media type
	 */
	getDefaultThumbnailByType : function(type) {
		"use strict";
		var thumbnail = "";
		switch (type) {
		case "AUDIO":
			thumbnail = "/images/audio-placeholder.jpg";
			break;
		case "VIDEO":
			thumbnail = "/images/video-placeholder.jpg";
			break;
		case "CONTAINER":
			thumbnail = "/images/container-placeholder.jpg";
			break;
		default:
			thumbnail = "/images/default-placeholder.jpg";
			break;
		}
		return thumbnail;
	},
	/**
	 * Gets thumbnail path out of media item object if exists otherwise gets default placeholder by type.
	 *
	 * @method getThumbnailPath
	 * @param mediaItem {Object}  media item object
	 * @param type {String} media type
	 * @return {String} thumbnail path
	 */
	getThumbnailPath : function(mediaItem, type) {
		"use strict";
		if (!!mediaItem) {
			if (!!mediaItem.thumbnailURIs && mediaItem.thumbnailURIs.length) {
				return mediaItem.thumbnailURIs[0];
			}
			if (!!mediaItem.type) {
				return this.getDefaultThumbnailByType(mediaItem.type);
			}
		}
		return this.getDefaultThumbnailByType(type || "");
	},
	/**
	 * Gets artist's name out of media item object.
	 *
	 * @method getArtistName
	 * @param mediaItem {Object} media item
	 * @return {String} artist name
	 */
	getArtistName : function(mediaItem) {
		"use strict";
		if (!!mediaItem && !!mediaItem.artists && mediaItem.artists.length) {
			return mediaItem.artists.join(", ");
		}
		return "Unknown";
	},
	/**
	 * Gets album name out of media item object.
	 *
	 * @method getAlbumName
	 * @param mediaItem {Object} media item
	 * @return {String} album name
	 */
	getAlbumName : function(mediaItem) {
		"use strict";
		if (!!mediaItem && !!mediaItem.album && mediaItem.album !== "") {
			return mediaItem.album;
		}
		return "Unknown";
	},
	/**
	 * Gets media item title out of media item object.
	 *
	 * @method getMediaItemTitle
	 * @param mediaItem {Object} media item
	 * @return {String} media title
	 */
	getMediaItemTitle : function(mediaItem) {
		"use strict";
		if (!!mediaItem && !!mediaItem.title && mediaItem.title !== "") {
			return mediaItem.title;
		}
		if (!!mediaItem && !!mediaItem.name && mediaItem.name !== "") {
			return mediaItem.name;
		}
		return "Unknown";
	},
	/**
	 * Calls fullscreen request for given html element.
	 *
	 * @method launchFullScreen
	 * @param element {Object}
	 */
	launchFullScreen : function(element) {
		"use strict";
		console.log("Launching full screen");
		if (element.requestFullScreen) {
			element.requestFullScreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullScreen) {
			element.webkitRequestFullScreen();
		}
	}
};