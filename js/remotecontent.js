/* global ko */

/**
 * @module MultimediaPlayerApplication
 */

/**
 * Class representing remote media content for MultiMedia Player.
 *
 * @class RemoteContent
 * @constructor
 */
var RemoteContent = function() {
	"use strict";
	var self = this;
	this.mediaServer = navigator.mediaServer;
	this.mediaSources = ko.observableArray([]);
	this.selectedMediaSource = ko.observable(null);

	this.mediaContainers = ko.observableArray([]);
	this.selectedMediaContainer = ko.observable(null);

	this.mediaContainerItems = ko.observableArray([]);
	this.selectedMediaContainerItem = ko.observable(null);

	this.currentBrowseOperation = "";
	this.alphabetFilter = ko.observable("");
	this.onMediaSourceLost = null;

	this.mediaSourcesComputed = ko.computed(function() {
		if (self.alphabetFilter() !== "") {
			return ko.utils.arrayFilter(self.mediaSources(), function(mediaSource) {
				return mediaSource.friendlyName.toString().toLowerCase().trim().indexOf(self.alphabetFilter().toString().toLowerCase().trim()) === 0;
			});
		}
		return self.mediaSources();
	});
	this.mediaContainersComputed = ko.computed(function() {
		if (self.alphabetFilter() !== "") {
			return ko.utils.arrayFilter(self.mediaContainers(), function(mediaContainer) {
				return mediaContainer.title.toString().toLowerCase().trim().indexOf(self.alphabetFilter().toString().toLowerCase().trim()) === 0;
			});
		}
		return self.mediaContainers();
	});
	this.mediaContainerItemsComputed = ko.computed(function() {
		if (self.alphabetFilter() !== "") {
			return ko.utils.arrayFilter(self.mediaContainerItems(), function(mediaItem) {
				return mediaItem.title.toString().toLowerCase().trim().indexOf(self.alphabetFilter().toString().toLowerCase().trim()) === 0;
			});
		}
		return self.mediaContainerItems();
	});
};

/**
 * Scans network for available DLNA server and adds it to media sources.
 *
 * @method scanMediaServerNetwork
 */
RemoteContent.prototype.scanMediaServerNetwork = function() {
	"use strict";
	var self = this;
	if (!!self.mediaServer) {
		self.clearDisappearedMediaSources();

		self.mediaServer.addEventListener('serverfound', function(source) {
                        self.addMediaSource(source.server);
                });
		self.mediaServer.scanNetwork();
	}
};

/**
 * Adds given media source to the list.
 *
 * @method addMediaSource
 * @param source {Object} media source
 */
RemoteContent.prototype.addMediaSource = function(source) {
	"use strict";
	var self = this;
	console.log(source);
	if (!!source) {
		if (!source.friendlyName) {
			return;
		}
		source.timestamp = new Date().getTime();
		var sourceExists = false;
		for ( var i = 0; i < self.mediaSources().length; ++i) {
			var src = self.mediaSources()[i];
			if (src.id === source.id) {
				self.mediaSources()[i] = source;
				sourceExists = true;
				break;
			}
		}
		if (!sourceExists) {
			self.mediaSources.push(source);
		}

		self.mediaSources.sort(function(left, right) {
			var leftFriendlyName = "Unknown";
			if (!!left.friendlyName && left.friendlyName !== "") {
				leftFriendlyName = left.friendlyName;
			}
			leftFriendlyName = leftFriendlyName.toString().trim().toLowerCase();
			var rightFriendlyName = "Unknown";
			if (!!right.friendlyName && right.friendlyName !== "") {
				rightFriendlyName = right.friendlyName;
			}
			rightFriendlyName = rightFriendlyName.toString().trim().toLowerCase();
			return leftFriendlyName === rightFriendlyName ? 0 : (leftFriendlyName < rightFriendlyName) ? -1 : 1;
		});
	}
};

/**
 * Sets given media source as selected and adds new media container based on the media source and sets it as selected.
 *
 * @method selectMediaSource
 * @param mediaSource {Object} media source
 */
RemoteContent.prototype.selectMediaSource = function(mediaSource) {
	"use strict";
	var self = this;
	console.log(mediaSource);
	self.selectedMediaSource(null);
	if (!!mediaSource) {
		self.selectedMediaSource(mediaSource);
		self.resetMediaContainers();
		self.resetMediaContainerItems();
		var mediaSourceContainerProps = {
			DisplayName : mediaSource.root.title,
			Path : mediaSource.root.id,
			Type : mediaSource.root.type
		};
		/*global mediacontent*/
		var mediaContainer = new mediacontent.MediaContainer(mediaSourceContainerProps);
		self.mediaContainers.push(mediaContainer);
		self.selectMediaContainer(mediaContainer);
	}
};

/**
 * Sets given media container as selected.
 *
 * @method selectMediaContainer
 * @param mediaSourceContainer {Object} media source container
 */
RemoteContent.prototype.selectMediaContainer = function(mediaSourceContainer) {
	"use strict";
	var self = this;
	console.log(mediaSourceContainer);
	if (!!mediaSourceContainer) {
		self.resetMediaContainerItems();

		for ( var i = self.mediaContainers().length - 1; i >= 0; --i) {
			if (self.mediaContainers()[i] !== mediaSourceContainer) {
				self.mediaContainers.pop();
			} else {
				break;
			}
		}
		console.log(self.mediaContainers());
		self.selectedMediaContainer(mediaSourceContainer);
		self.browseMediaSourceContainer(self.selectedMediaSource(), mediaSourceContainer);
	}
};

/**
 * Sets given media container item as selected.
 *
 * @method selectMediaContainerItem
 * @param mediaContainerItem {Object} media source container
 */
RemoteContent.prototype.selectMediaContainerItem = function(mediaContainerItem) {
	"use strict";
	var self = this;
	console.log(mediaContainerItem);
	if (!!mediaContainerItem) {
		self.selectedMediaContainerItem(mediaContainerItem);
		if (mediaContainerItem.type === "CONTAINER") {
			self.mediaContainers.push(mediaContainerItem);
			self.selectMediaContainer(mediaContainerItem);
		}
	}
};

/**
 * Sets selected media source to null and empties media sources.
 *
 * @method resetMediaSource
 */
RemoteContent.prototype.resetMediaSource = function() {
	"use strict";
	var self = this;
	self.selectedMediaSource(null);
	self.mediaSources.removeAll();
	self.mediaSources([]);
};

/**
 * Removes expired media sources and invokes onMediaSourceLost listener.
 *
 * @method clearDisappearedMediaSources
 */
RemoteContent.prototype.clearDisappearedMediaSources = function() {
	"use strict";
	var self = this;
	if (self.mediaSources().length) {
		for ( var i = self.mediaSources().length - 1; i >= 0; --i) {
			if (new Date().getTime() - self.mediaSources()[i].timestamp > 10000) {
				var mediaSourceId = self.mediaSources()[i].id;
				self.mediaSources.remove(self.mediaSources()[i]);
				if (!!self.onMediaSourceLost) {
					self.onMediaSourceLost(mediaSourceId);
				}
			}
		}
	}
};

/**
 * Sets the listener to receive notifications when media source is lost.
 *
 * @method setMediaSourceLostListener
 * @param onMediaSourceLost {Function(mediaSourceId)} Event listener to be set.
 */
RemoteContent.prototype.setMediaSourceLostListener = function(onMediaSourceLost) {
	"use strict";
	var self = this;
	if (!!onMediaSourceLost) {
		self.onMediaSourceLost = onMediaSourceLost;
	}
};

/**
 * Sets selected media container to null and empties media containers.
 *
 * @method resetMediaContainers
 */
RemoteContent.prototype.resetMediaContainers = function() {
	"use strict";
	var self = this;
	self.selectedMediaContainer(null);
	self.mediaContainers.removeAll();
	self.mediaContainers([]);
};

/**
 * Sets selected media container item to null and empties media container items.
 *
 * @method resetMediaContainerItems
 */
RemoteContent.prototype.resetMediaContainerItems = function() {
	"use strict";
	var self = this;
	self.selectedMediaContainerItem(null);
	self.mediaContainerItems.removeAll();
	self.mediaContainerItems([]);
};

/**
 * Gets media source by its id.
 *
 * @method getMediaSourceById
 * @param id (String) media source id
 */
RemoteContent.prototype.getMediaSourceById = function(id) {
	"use strict";
	var self = this;
	var mediaSource = ko.utils.arrayFirst(self.mediaSources(), function(ms) {
		return ms.id === id;
	});
	return mediaSource;
};

/**
 * Gets media container by its id.
 *
 * @method getMediaContainerById
 * @param id {String} media container id
 */
RemoteContent.prototype.getMediaContainerById = function(id) {
	"use strict";
	var self = this;
	var mediaContainer = ko.utils.arrayFirst(self.mediaContainers(), function(mc) {
		return mc.id === id;
	});
	return mediaContainer;
};

/**
 * Browses given media source container.
 *
 * @method browseMediaSourceContainer
 * @param source {Object} media source
 * @param container {Object} media container
 */
RemoteContent.prototype.browseMediaSourceContainer = function(source, container) {
	"use strict";
	var self = this;
	var browseCount = 100;
	var browseOffset = 0;
	var localOp = "Browse_" + source.id + "_" + container.id;

	function browseErrorCB(str) {
		console.log("Error browsing " + container.id + " : " + str);
	}

	function browseContainerCB(jsonArray) {
		console.log(jsonArray);
		if (self.currentBrowseOperation !== localOp) {
			return;
		}
		for ( var i = 0; i < jsonArray.length; ++i) {
			self.mediaContainerItems.push(mediacontent.mediaObjectForProps(jsonArray[i]));
		}

		if (jsonArray.length === browseCount) {
			browseOffset += browseCount;
			source.browse(container.id, "+DisplayName", browseCount, browseOffset).then(browseContainerCB);
		} else {
			self.currentBrowseOperation = "";
		}
	}

	if (self.currentBrowseOperation === localOp) {
		return;
	}

	self.currentBrowseOperation = localOp;

	source.browse(container.id, "+DisplayName", browseCount, browseOffset).then(browseContainerCB)
};

/**
 * Gets audio media items from selected container.
 *
 * @method getAudioFromSelectedContainer
 */
RemoteContent.prototype.getAudioFromSelectedContainer = function() {
	"use strict";
	var self = this;
	if (!!self.mediaContainerItemsComputed() && self.mediaContainerItemsComputed().length) {
		return ko.utils.arrayFilter(self.mediaContainerItemsComputed(), function(mediaItem) {
			return mediaItem.type === "AUDIO";
		});
	}
	return [];
};

/**
 * Gets video media items from selected container.
 *
 * @method getVideoFromSelectedContainer
 */
RemoteContent.prototype.getVideoFromSelectedContainer = function() {
	"use strict";
	var self = this;
	if (!!self.mediaContainerItemsComputed() && self.mediaContainerItemsComputed().length) {
		return ko.utils.arrayFilter(self.mediaContainerItemsComputed(), function(mediaItem) {
			return mediaItem.type === "VIDEO";
		});
	}
	return [];
};
