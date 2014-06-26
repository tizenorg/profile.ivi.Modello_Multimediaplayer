/******************************************************************************
 * Copyright 2012 Intel Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *****************************************************************************/

/**
 * @module MultimediaPlayerApplication
 */

/**
 * Class providing objects mapping the org.gnome.UPnP MediaObject2 and MediaItem2 interfaces.
 *
 * @class mediacontent
 */
var mediacontent = window.mediacontent = {};

/**
 * Generic media object.
 *
 * @class MediaObject
 * @return {Object} MediaObject objects
 */
mediacontent.MediaObject = function(proxy) {
	"use strict";
	this.proxy = proxy;
	if (proxy) {
		this.id = proxy.Path;
		this.type = proxy.Type;
		this.title = proxy.DisplayName;
	}
	return this;
};

/**
 * Gets the MediaObject metadata info.
 *
 * @method getMetaData
 * @return {Object} metadata object
 */
mediacontent.MediaObject.prototype.getMetaData = function() {
	"use strict";
	return this.proxy.callMethod("org.gnome.UPnP.MediaObject2", "GetMetaData", []);
};

/**
 * Mediacontent object of type container.
 *
 * @class MediaContainer
 * @param proxy {Object} media source object
 * @return {Object} MediaContainer object
 */
mediacontent.MediaContainer = function(proxy) {
	"use strict";
	mediacontent.MediaObject.call(this, proxy);
	this.type = "CONTAINER";
	this.directoryURI = "";
	this.storageType = "EXTERNAL";
	this.title = proxy.title;
	if (this.id === undefined)
		this.id = proxy.id;

	return this;
};

mediacontent.MediaContainer.prototype = new mediacontent.MediaObject();
mediacontent.MediaContainer.prototype.constructor = mediacontent.MediaContainer;

/**
 * Mediacontent object of type media item. Provides access to properties of media items.
 *
 * @class MediaItem
 * @param proxy {Object} media source object
 * @return {Object} MediaItem object
 */
mediacontent.MediaItem = function(proxy) {
	"use strict";
	mediacontent.MediaObject.call(this, proxy);
	if (proxy) {
		this.mimeType = proxy.mimeType;
		if (proxy.URLs) {
			this.contentURI = proxy.URLs[0];
		} else {
			this.contentURI = proxy.sourceUri;
		}
		this.size = proxy.fileSize;
		this.releaseDate = proxy.createDate;
		this.modifiedDate = null;
		this.name = proxy.title;
		this.title = proxy.title;
		this.editableAttributes = [];
		this.thumbnailURIs = [];
		if (!!proxy.AlbumArtURL && proxy.AlbumArtURL !== "") {
			this.thumbnailURIs.push(proxy.AlbumArtURL);
		}
		this.description = "Unknown";
		this.rating = 0;
	}
	this.type = "OTHER";
	return this;
};

mediacontent.MediaItem.prototype = new mediacontent.MediaObject();
mediacontent.MediaItem.prototype.constructor = mediacontent.MediaItem;

/**
 * Mediacontent object of type video. Extends a basic media item object with video-specific attributes.
 *
 * @class MediaVideo
 * @param proxy {Object} media source object
 * @return {Object} MediaVideo object
 */
mediacontent.MediaVideo = function(proxy) {
	"use strict";
	mediacontent.MediaItem.call(this, proxy);
	if (proxy) {
		this.duration = proxy.duration * 1000; //Tizen's ContentVideo is in ms
		this.width = proxy.width;
		this.height = proxy.height;
		if (proxy.Album) {
			this.album = proxy.Album;
		}
		else if (proxy.collection) {
			this.album = proxy.collection;
		}
		else {
			this.album = "Unknown";
		}

		if (proxy.Artist) {
			this.artists = [ proxy.Artist ];
		}
		else if (proxy.author) {
                        this.artists = [ proxy.author ];
                }
		else {
			this.artists = [ "Unknown" ];
		}
		this.geolocation = null;
	}
	this.type = "VIDEO";
	return this;
};

mediacontent.MediaVideo.prototype = new mediacontent.MediaItem();
mediacontent.MediaVideo.prototype.constructor = mediacontent.MediaVideo;

/**
 * Mediacontent object of type audio. Extends a basic media item object with audio-specific attributes.
 *
 * @class MediaAudio
 * @param proxy {Object} media source object
 * @return {Object} MediaAudio object
 */
mediacontent.MediaAudio = function(proxy) {
	"use strict";
	mediacontent.MediaItem.call(this, proxy);
	if (proxy) {
		this.bitrate = proxy.audioSampleRate;
		this.duration = proxy.duration * 1000; //Tizen's ContentAudio is in ms
		if (proxy.Album) {
			this.album = proxy.Album;
		} else {
			this.album = "Unknown";
		}
		if (proxy.Artist) {
			this.artists = [ proxy.Artist ];
		}
		else if (proxy.author) {
                        this.artists = [ proxy.author ];
		} else {
			this.artists = [ "Unknown" ];
		}
		this.genres = [];
		this.composers = [ "Unknown" ];
		this.lyrics = null;
		this.copyright = "Unknown";
		if (proxy.trackNumber)
			this.trackNumber = proxy.trackNumber;
		else
			this.trackNumber = 0;
	}
	this.type = "AUDIO";
	return this;
};

mediacontent.MediaAudio.prototype = new mediacontent.MediaItem();
mediacontent.MediaAudio.prototype.constructor = mediacontent.MediaAudio;

/**
 * Mediacontent object of type image. Extends a basic media item object with image-specific attributes.
 *
 * @class MediaImage
 * @param proxy {Object} media source object
 * @return {Object} MediaImage object
 */
mediacontent.MediaImage = function(proxy) {
	"use strict";
	mediacontent.MediaItem.call(this, proxy);
	if (proxy) {
		this.width = proxy.width;
		this.height = proxy.height;
		this.orientation = "NORMAL";
	}
	this.type = "IMAGE";
	return this;
};

mediacontent.MediaImage.prototype = new mediacontent.MediaItem();
mediacontent.MediaImage.prototype.constructor = mediacontent.MediaImage;

/**
 * Returns appropriate media object based on the given parameter media type.
 *
 * @class mediaObjectForProps
 * @param props {Object} media source object
 * @return {Object} correct media object by props.type
 */
mediacontent.mediaObjectForProps = function(props) {
	"use strict";

	if (props.type.indexOf("container") === 0 || props.type.indexOf("album") === 0 || props.type.indexOf("person") === 0 || props.type.indexOf("genre") === 0){
		return new mediacontent.MediaContainer(props);
	}
	if (props.type.indexOf("video") === 0){
		return new mediacontent.MediaVideo(props);
	}
	if (props.type.indexOf("audio") === 0 || props.type.indexOf("music") === 0){
		return new mediacontent.MediaAudio(props);
	}
	if (props.type.indexOf("image") === 0 || props.type.indexOf("picture") === 0) {
		return new mediacontent.MediaImage(props);
	}

	return new mediacontent.MediaItem(props);
};
