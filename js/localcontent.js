/*global ko */

/**
 * @module MultimediaPlayerApplication
 */

/**
 * Class representing local media content for MultiMedia Player.
 *
 * @class LocalContent
 * @constructor
 */
var LocalContent = function() {
	"use strict";
	var self = this;
	this.content = tizen.content;
	this.localContent = ko.observableArray([]);
	this.history = ko.observableArray([]);

	this.audioType = "AUDIO";
	this.allAudioContent = ko.observableArray([]);
	this.findAllAudioContent();

	this.videoType = "VIDEO";
	this.allVideoContent = ko.observableArray([]);
	this.findAllVideoContent();

	this.alphabetFilter = ko.observable("");

	this.localContentComputed = ko.computed(function() {
		if (self.alphabetFilter() !== "") {
			return ko.utils.arrayFilter(self.localContent(), function(content) {
				return content.title.toString().toLowerCase().trim().indexOf(self.alphabetFilter().toString().toLowerCase().trim()) === 0;
			});
		}
		return self.localContent();
	});
};

/**
 * This method fills local content with media categories.
 *
 * @method fillCategories
 */
LocalContent.prototype.fillCategories = function() {
	"use strict";
	var self = this;
	var resultCategories = self.getCategories();
	self.localContent(resultCategories);
};

/**
 * This method provides media categories content.
 *
 * @method getCategories
 * @return {Array} categories array
 */
LocalContent.prototype.getCategories = function() {
	"use strict";
	var self = this;
	var categories = [];
	categories.push({
		title : "MUSIC",
		subtitle : "",
		operation : "browse_category",
		type : self.audioType
	});
	categories.push({
		title : "VIDEOS",
		subtitle : "",
		operation : "browse_category",
		type : self.videoType
	});
	console.log(categories);
	return categories;
};

/**
 * This method fills local content array with media sub categories based on the content type.
 *
 * @method getCategories
 */
LocalContent.prototype.fillSubCategories = function(content) {
	"use strict";
	var self = this, resultCategories = [];
	switch (content.type) {
	case self.audioType:
		resultCategories = self.getAudioSubCategories(content.type);
		break;
	case self.videoType:
		resultCategories = self.getVideoSubCategories(content.type);
		break;
	default:
		console.log("Type not supported");
		break;
	}
	self.localContent(resultCategories);
};

/**
 * This method provides audio categories content by type.
 *
 * @method getAudioSubCategories
 * @param type {Object} media content type
 * @return {Array} result categories array
 */
LocalContent.prototype.getAudioSubCategories = function(type) {
	"use strict";
	var self = this;
	var categories = [ "ARTISTS", "ALBUMS", "ALL" ];
	var resultCategories = [];
	for ( var i = 0; i < categories.length; ++i) {
		resultCategories.push({
			title : categories[i],
			subtitle : "",
			operation : "browse_" + categories[i].toLowerCase(),
			type : type
		});
	}
	console.log(resultCategories);
	return resultCategories;
};

/**
 * This method provides video categories content by type.
 *
 * @method getVideoSubCategories
 * @param type {Object} media content type
 * @return {Array} result categories array
 */
LocalContent.prototype.getVideoSubCategories = function(type) {
	"use strict";
	var self = this;
	var categories = [ "ARTISTS", "ALBUMS", "ALL" ];
	var resultCategories = [];
	for ( var i = 0; i < categories.length; ++i) {
		resultCategories.push({
			title : categories[i],
			subtitle : "",
			operation : "browse_" + categories[i].toLowerCase(),
			type : type
		});
	}
	console.log(resultCategories);
	return resultCategories;
};

/**
 * This method fills local content array with artists.
 *
 * @method fillArtists
 * @param content {Object} media content
 */
LocalContent.prototype.fillArtists = function(content) {
	"use strict";
	var self = this;
	var resultArtists = self.getAllArtists(content.type);
	self.localContent(resultArtists);
	self.localContent.sort(self.compareByTitle);
};

/**
 * This method provides media content based on the type.
 *
 * @method getMediaContentByType
 * @param type {String} media content type
 * @return {Object} media content
 */
LocalContent.prototype.getMediaContentByType = function(type) {
	"use strict";
	var self = this, mediaContent = null;
	switch (type) {
	case self.audioType:
		mediaContent = self.allAudioContent;
		break;
	case self.videoType:
		mediaContent = self.allVideoContent;
		break;
	default:
		console.log("Type not supported");
		break;
	}
	return mediaContent.slice(0);
};

/**
 * This method provides all artists content by type.
 *
 * @method getAllArtists
 * @param type {String} media content type
 * @return {Array} artists array
 */
LocalContent.prototype.getAllArtists = function(type) {
	"use strict";
	var self = this, resultArtists = [], mediaContent;
	mediaContent = self.getMediaContentByType(type);
	if (!!mediaContent && mediaContent.length) {
		var artists = ko.utils.arrayMap(mediaContent, function(content) {
			if (!!content.artists && content.artists.length) {
				return content.artists.join(", ");
			}
			return "Unknown";
		});

		if (artists.length) {
			var uniqueArtists = ko.utils.arrayGetDistinctValues(artists);
			ko.utils.arrayForEach(uniqueArtists, function(artist) {
				var artistAlbumsAndContent = self.getArtistAlbumsAndContent(artist, type);
				resultArtists.push({
					artist : artist,
					type : type,
					title : artist,
					subtitle : artistAlbumsAndContent.albums.length + (artistAlbumsAndContent.albums.length === 1 ? " ALBUM, " : " ALBUMS, ") +
							artistAlbumsAndContent.content.length +
							(type === self.audioType ? (artistAlbumsAndContent.content.length === 1 ? " TRACK" : " TRACKS") :
							(artistAlbumsAndContent.content.length === 1 ? " MOVIE" : " MOVIES")),
					operation : "browse_artist"
				});
			});
		}
	}
	console.log(resultArtists);
	return resultArtists;
};

/**
 * This method provides albums and media content for a given artist and type of content.
 *
 * @method getArtistAlbumsAndContent
 * @param artist {String} artist
 * @param type {String} media content type
 * @return {Object} a result object
 */
LocalContent.prototype.getArtistAlbumsAndContent = function(artist, type) {
	"use strict";
	var self = this;
	var result = {
		artist : artist,
		albums : [],
		content : []
	};
	var mediaContent = self.getMediaContentByType(type);
	if (!!mediaContent && mediaContent.length && !!artist && artist !== "") {
		var artistContent = ko.utils.arrayFilter(mediaContent, function(content) {
			/*global Utils */
			var artistName = Utils.getArtistName(content);
			return artistName === artist;
		});
		var artistAlbums = ko.utils.arrayMap(artistContent, function(content) {
			var artistAlbumName = Utils.getAlbumName(content);
			return artistAlbumName;
		});
		var uniqueArtistAlbums = ko.utils.arrayGetDistinctValues(artistAlbums);
		if (!!uniqueArtistAlbums && uniqueArtistAlbums.length) {
			result.albums = uniqueArtistAlbums;
		}
		if (!!artistContent && artistContent.length) {
			result.content = artistContent;
		}
	}
	console.log(result);
	return result;
};

/**
 * This method fills local content with albums for a given artist and type of content.
 *
 * @method fillArtistAlbums
 * @param content {Object} media content info
 */
LocalContent.prototype.fillArtistAlbums = function(content) {
	"use strict";
	var self = this;
	var artistAlbums = self.getArtistAlbums(content.artist, content.type);
	self.localContent(artistAlbums);
	self.localContent.sort(self.compareByTitle);
};

/**
 * This method provides albums for a given artist and type of content.
 *
 * @method getArtistAlbums
 * @param artist {String} artist
 * @param type {String} media content type
 * @return {Array} albums array
 */
LocalContent.prototype.getArtistAlbums = function(artist, type) {
	"use strict";
	var self = this, resultAlbums = [];
	var artistAlbumsAndContent = self.getArtistAlbumsAndContent(artist, type);
	ko.utils.arrayForEach(artistAlbumsAndContent.albums, function(album) {
		var newAlbum = self.createAlbum(artist, album, type);
		resultAlbums.push(newAlbum);
	});
	console.log(resultAlbums);
	return resultAlbums;
};

/**
 * This method creates a new album object for a given artist, album and type of content.
 *
 * @method getArtistAlbums
 * @param artist {String} artist
 * @param album {String} album title
 * @param type {String} media content type
 * @return {Object} album object
 */
LocalContent.prototype.createAlbum = function(artist, album, type) {
	"use strict";
	var self = this;
	var newAlbum = {
		artist : artist,
		album : album,
		title : album,
		subtitle : artist,
		thumbnail : self.getArtistAlbumThumbnail(artist, album, type),
		operation : "browse_album",
		type : type
	};
	return newAlbum;
};

/**
 * This method fills local content with album for a given artist, album and type of content.
 *
 * @method fillArtistAlbumContent
 * @param content {Object} media content
 */
LocalContent.prototype.fillArtistAlbumContent = function(content) {
	"use strict";
	var self = this;
	var artistAlbumContent = self.getArtistAlbumContent(content.artist, content.album, content.type);
	self.localContent(artistAlbumContent);
	self.localContent.sort(self.compareByTitle);
};

/**
 * This method provides album content for a given artist, album and type of content.
 *
 * @method getArtistAlbumContent
 * @param artist {String} artist
 * @param album {String} album title
 * @param type {String} media content type
 * @return {Object} content object
 */
LocalContent.prototype.getArtistAlbumContent = function(artist, album, type) {
	"use strict";
	var self = this, resultContent = [], mediaContent;
	mediaContent = self.getMediaContentByType(type);
	if (!!mediaContent && mediaContent.length) {
		resultContent = ko.utils.arrayFilter(mediaContent, function(content) {
			var artistName = Utils.getArtistName(content);
			var artistAlbumName = Utils.getAlbumName(content);
			return artistName === artist && artistAlbumName === album;
		});
	}
	console.log(resultContent);
	return resultContent;
};

/**
 * This method fills local content with albums for a given type of content.
 *
 * @method fillAlbums
 * @param content {Object} media content
 */
LocalContent.prototype.fillAlbums = function(content) {
	"use strict";
	var self = this;
	var allAlbums = self.getAllAlbums(content.type);
	self.localContent(allAlbums);
	self.localContent.sort(self.compareByTitle);
};

/**
 * This method provides all albums for a given type of content.
 *
 * @method getAllAlbums
 * @param type {String} media content type
 * @return {Array} albums array
 */
LocalContent.prototype.getAllAlbums = function(type) {
	"use strict";
	var self = this, resultAlbums = [], mediaContent;
	mediaContent = self.getMediaContentByType(type);
	if (!!mediaContent && mediaContent.length) {
		var albums = ko.utils.arrayMap(mediaContent, function(content) {
			var artistName = Utils.getArtistName(content);
			var artistAlbumName = Utils.getAlbumName(content);
			var album = {
				artist : artistName,
				album : artistAlbumName
			};
			return JSON.stringify(album);
		});
		if (!!albums && albums.length) {
			var uniqueAlbums = ko.utils.arrayGetDistinctValues(albums);
			ko.utils.arrayForEach(uniqueAlbums, function(albumJSON) {
				var album = JSON.parse(albumJSON);
				var newAlbum = self.createAlbum(album.artist, album.album, type);
				resultAlbums.push(newAlbum);
			});
		}
	}
	console.log(resultAlbums);
	return resultAlbums;
};

/**
 * This method fills local content with albums for a given type of content.
 *
 * @method fillAlbums
 * @param content {Object} media content
 */
LocalContent.prototype.fillAll = function(content) {
	"use strict";
	var self = this, mediaContent;
	mediaContent = self.getMediaContentByType(content.type);
	self.localContent(mediaContent);
	self.localContent.sort(self.compareByTitle);
};

/**
 * This method empties local content.
 *
 * @method clearLocalContent
 */
LocalContent.prototype.clearLocalContent = function() {
	"use strict";
	var self = this;
	self.localContent.removeAll();
	self.localContent([]);
};

/**
 * This method empties history of opened local content.
 *
 * @method clearLocalContent
 */
LocalContent.prototype.clearHistory = function() {
	"use strict";
	var self = this;
	self.history.removeAll();
	self.history([]);
};

/**
 * This method adds given local content to history of opened local content and clears local content.
 *
 * @method pushToHistory
 * @param content {Object} media content
 */
LocalContent.prototype.pushToHistory = function(content) {
	"use strict";
	var self = this;
	self.clearLocalContent();
	self.history.push(content);
};

/**
 * This method gets a thumbnail for a given artist, album and type of media content.
 *
 * @method getArtistAlbumThumbnail
 * @param artist {String} artist
 * @param album {String} album title
 * @param type {String} media content type
 */
LocalContent.prototype.getArtistAlbumThumbnail = function(artist, album, type) {
	"use strict";
	var self = this;
	var artistAlbumContent = this.getArtistAlbumContent(artist, album, type);
	var contentWithThumbnail = ko.utils.arrayFirst(artistAlbumContent, function(content) {
		return !!content.thumbnailURIs && content.thumbnailURIs.length;
	});
	return Utils.getThumbnailPath(contentWithThumbnail, type);
};

/**
 * This method filters audio content out of all content.
 *
 * @method findAllAudioContent
 */
LocalContent.prototype.findAllAudioContent = function() {
	"use strict";
	var self = this;
	if (!!self.content) {
		var filter = new tizen.AttributeFilter("type", "EXACTLY", self.audioType);
		self.content.find(function(content) {
			self.onContentArraySuccess(content, self.audioType);
		}, function(error) {
			self.onError(error);
		}, null, filter);
	}
};

/**
 * This method filters video content out of all content.
 *
 * @method findAllVideoContent
 */
LocalContent.prototype.findAllVideoContent = function() {
	"use strict";
	var self = this;
	if (!!self.content) {
		var filter = new tizen.AttributeFilter("type", "EXACTLY", self.videoType);
		self.content.find(function(content) {
			self.onContentArraySuccess(content, self.videoType);
		}, function(error) {
			self.onError(error);
		}, null, filter);
	}
};

/**
 * This method is success callback for find content methods (findAllAudioContent and findAllVideoContent).
 *
 * @method onContentArraySuccess
 * @param content {Object} media content
 * @param type {String} content type
 */
LocalContent.prototype.onContentArraySuccess = function(content, type) {
	"use strict";
	var self = this;
	console.log(content);

	content.sort(self.compareByTitle);

	switch (type) {
	case self.audioType:
		self.allAudioContent(content);
		break;
	case self.videoType:
		self.allVideoContent(content);
		break;
	default:
		break;
	}
};

/**
 * This method compares neighbouring content items by their titles for sorting.
 *
 * @method compareByTitle
 * @param left {Object} media content
 * @param right {Object} media content
 */
LocalContent.prototype.compareByTitle = function(left, right) {
	"use strict";
	var leftTitle = "Unknown";
	if (!!left.title && left.title !== "") {
		leftTitle = left.title;
	}
	leftTitle = leftTitle.toString().trim().toLowerCase();
	var rightTitle = "Unknown";
	if (!!right.title && right.title !== "") {
		rightTitle = right.title;
	}
	rightTitle = rightTitle.toString().trim().toLowerCase();
	return leftTitle === rightTitle ? 0 : (leftTitle < rightTitle) ? -1 : 1;
};

/**
 * This method is error callback for find content methods (findAllAudioContent and findAllVideoContent).
 *
 * @method onError
 * @param error {Object} returned error
 */
LocalContent.prototype.onError = function(error) {
	"use strict";
	var self = this;
	console.log(error);
};

/**
 * This method gets selected local content based on the content type.
 *
 * @method getSelectedLocalContent
 * @param type {String} media content type
 * @return {Object} mediaItem object
 */
LocalContent.prototype.getSelectedLocalContent = function(type) {
	"use strict";
	var self = this;
	if (!!self.localContent() && self.localContent().length) {
		return ko.utils.arrayFilter(self.localContent(), function(mediaItem) {
			return mediaItem.type === type;
		});
	}
	return [];
};