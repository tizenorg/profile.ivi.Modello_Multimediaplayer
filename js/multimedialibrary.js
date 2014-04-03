/**
 * @module MultimediaPlayerApplication
 */

/**
 * Class which provides methods to operate with Multimedia player library that utilizes {{#crossLink "Library"}}{{/crossLink}} component.
 * Library allows user to select either LOCAL or REMOTE content.
 * LOCAL content tab is devided by content type into 2 categories: MUSIC and VIDEOS. Each content type can be browsed by ARTISTS, ALBUMS or ALL (all audio tracks / all video files). Moreover ARTISTS can be browsed by ALBUMS.
 * Following hierarchical list represents structure of LOCAL content:
 *
 * * LOCAL
 *  * MUSIC
 *      * ARTISTS
 *          * ALBUMS
 *      * ALBUMS
 *      * ALL
 *  * VIDEOS
 *      * ARTISTS
 *          * ALBUMS
 *      * ALBUMS
 *      * ALL
 *
 * REMOTE content tab contains alphabetically sorted list of available DLNA media servers and integrates browsing of DLNA Media Container of selected DLNA media server
 * starting from root element and drill down through folders (keeps the structure as is defined by remote server).
 *
 * Clicking audio track in library selects all audio items from the current list, creates and sets audio player playlist, shows and fills in the media carousel and starts playing selected track.
 * Clicking video file in library selects all video items from the current list, creates a sets video player playlist, shows video element and starts playing selected video. Clicking on the rendered video or back button lets the user toggle between windowed and fullscreen presentation of the video.
 *
 * @class MultimediaLibrary
 * @static
 */
var MultimediaLibrary = {
	remoteContent : null,
	remoteContentReScanInterval : null,
	localContent : null,
	carousel : null,
	speechObj : null,
	/*global ko */
	mediaContentTemplate : ko.observable(""),
	/**
	 * Holds status of music library initialization.
	 *
	 * @property initialized {Boolean}
	 */
	initialized : false,
	/**
	 * Method is initializing music library.
	 *
	 * @method init
	 */
	init : function() {
		"use strict";
		/*global RemoteContent*/
		MultimediaLibrary.remoteContent = new RemoteContent();
		MultimediaLibrary.remoteContent.setMediaSourceLostListener(function(mediaSourceId) {
			if ($("#mediaContentList").length) {
				if (!!MultimediaLibrary.remoteContent.selectedMediaSource() && MultimediaLibrary.remoteContent.selectedMediaSource().id === mediaSourceId) {
					MultimediaLibrary.showMediaSources();
				}
			}
		});
		/*global LocalContent*/
		MultimediaLibrary.localContent = new LocalContent();
		/*global Carousel*/
		MultimediaLibrary.carousel = new Carousel();
		MultimediaLibrary.carousel.addIndexChangeListener(function(index) {
			console.log("NEW CAROUSEL INDEX " + index);
			if ($('#multimediaPlayer').audioAPI('getCurrentPlayerType') === MultimediaLibrary.localContent.audioType) {
				$('#multimediaPlayer').audioAPI('play', index);
			}
		});
		$('#multimediaPlayer').audioAPI('addIndexChangeListener', function(index) {
			console.log("NEW PLAYER INDEX " + index);
			if ($('#multimediaPlayer').audioAPI('getCurrentPlayerType') === MultimediaLibrary.localContent.audioType) {
				MultimediaLibrary.carousel.slideTo(index);
			}
		});

		$('#musicLibrary').library("setSectionTitle", "MULTIMEDIA LIBRARY");
		$('#musicLibrary').library("init");

		var tabMenuItems = [ {
			text : "LOCAL",
			selected : true
		}, {
			text : "REMOTE",
			selected : false
		} ];

		var tabMenuModel = {
			Tabs : tabMenuItems
		};
		$('#library').library("setAlphabetVisible", true);
		$('#musicLibrary').library("tabMenuTemplateCompile", tabMenuModel);
		$('#musicLibrary').bind('eventClick_GridViewBtn', function() {
			$('#musicLibrary').library('changeContentClass', "musicLibraryContentGrid");
		});
		$('#musicLibrary').bind('eventClick_ListViewBtn', function() {
			$('#musicLibrary').library('changeContentClass', "musicLibraryContentList");
		});
		$('#musicLibrary').bind('eventClick_SearchViewBtn', function() {
			// search code here
		});
		$('#musicLibrary').bind('eventClick_menuItemBtn', function(e, data) {
			MultimediaLibrary.renderTabContent(data.Index);
		});
		$('#musicLibrary').bind('eventClick_closeSubpanel', function() {
		});
		$("#alphabetBookmarkList").on("letterClick", function(event, letter) {
			console.log(letter);
			MultimediaLibrary.remoteContent.alphabetFilter(letter === "*" ? "" : letter);
			MultimediaLibrary.localContent.alphabetFilter(letter === "*" ? "" : letter);
		});
		MultimediaLibrary.renderTabContent($('#musicLibrary').library('getSelectetTopTabIndex'));
		MultimediaLibrary.initialized = true;
	},
	/**
	 * Shows music library panel.
	 *
	 * @method show
	 */
	show : function() {
		"use strict";
		$('#musicLibrary').library("showPage");
	},
	/**
	 * Hides music library panel.
	 *
	 * @method hide
	 */
	hide : function() {
		"use strict";
		$('#musicLibrary').library("hidePage");
	},
	/**
	 * Renders the Multimedia library content for given library tab.
	 *
	 * @method renderTabContent
	 */
	renderTabContent : function(tabIndex) {
		"use strict";
		switch (tabIndex) {
		case 0:
			MultimediaLibrary.showLocalContent();
			break;
		case 1:
			MultimediaLibrary.showMediaSources();
			break;
		default:
			break;
		}
	},
	/**
	 * Shows local content categories [Music, Videos] in grid or list view.
	 *
	 * @method showLocalContent
	 */
	showLocalContent : function() {
		"use strict";
		var view = "";
		switch ($('#musicLibrary').library('getSelectetLeftTabIndex')) {
		/*global GRID_TAB, LIST_TAB*/
		case GRID_TAB:
			view = "musicLibraryContentGrid";
			break;
		case LIST_TAB:
			view = "musicLibraryContentList";
			break;
		default:
			view = "musicLibraryContentList";
			break;
		}
		MultimediaLibrary.localContent.clearLocalContent();
		MultimediaLibrary.localContent.clearHistory();
		$('#musicLibrary').library('closeSubpanel');
		$('#musicLibrary').library("clearContent");
		$('#musicLibrary').library("changeContentClass", view);
		MultimediaLibrary.mediaContentTemplate("localContentCategoryItemTemplate");
		var localContentElement = '<div data-bind="template: { name: function() { return MultimediaLibrary.mediaContentTemplate(); }, foreach: MultimediaLibrary.localContent.localContentComputed }"></div>';
		$(localContentElement).appendTo($('.' + view));
		ko.applyBindings(MultimediaLibrary.localContent);
		MultimediaLibrary.localContent.fillCategories();
	},
	/**
	 * Shows available media sources/servers in grid or list view.
	 *
	 * @method showMediaSources
	 */
	showMediaSources : function() {
		"use strict";
		var view = "";
		switch ($('#musicLibrary').library('getSelectetLeftTabIndex')) {
		case GRID_TAB:
			view = "musicLibraryContentGrid";
			break;
		case LIST_TAB:
			view = "musicLibraryContentList";
			break;
		default:
			view = "musicLibraryContentList";
			break;
		}
		$('#musicLibrary').library('closeSubpanel');
		$('#musicLibrary').library("clearContent");
		$('#musicLibrary').library("changeContentClass", view);
		var mediaSourcesElement = '<div id="remoteMediaServers" data-bind="template: { name: \'mediaSourceItemTemplate\', foreach: MultimediaLibrary.remoteContent.mediaSourcesComputed }"></div>';
		$(mediaSourcesElement).appendTo($('.' + view));
		ko.applyBindings(MultimediaLibrary.remoteContent);
		MultimediaLibrary.remoteContent.selectedMediaSource(null);
		MultimediaLibrary.remoteContent.resetMediaContainers();
		MultimediaLibrary.remoteContent.resetMediaContainerItems();
		MultimediaLibrary.remoteContent.scanMediaServerNetwork();
		if (!MultimediaLibrary.remoteContentReScanInterval) {
			MultimediaLibrary.remoteContentReScanInterval = setInterval(function() {
				if (($("#mediaContentList").length || $("#remoteMediaServers").length) && $('#musicLibrary').library('isVisible')) {
					MultimediaLibrary.remoteContent.scanMediaServerNetwork();
				}
			}, 5000);
		}
	},
	/**
	 * Opens the supplied media source/server, shows the content of its root
	 * directory and navigation bar containing the name of selected server and
	 * back button to navigate back to list of available media sources.
	 *
	 * @method selectRemoteMediaSource {Object} Representation of media
	 *         source/server to be opened.
	 * @param mediaSource {}
	 */
	selectRemoteMediaSource : function(mediaSource) {
		"use strict";
		if (!!mediaSource) {
			MultimediaLibrary.remoteContent.selectMediaSource(mediaSource);
			var subpanelModel = {
				action : function() {
					MultimediaLibrary.goBackRemoteContent();
				},
				actionName : "BACK",
				textTitle : "SERVER",
				textSubtitle : mediaSource.friendlyName ? mediaSource.friendlyName.toUpperCase() : "-"
			};
			$('#musicLibrary').library("subpanelContentTemplateCompile", subpanelModel);
		}

		$('#musicLibrary').library("clearContent");
		var viewType = "";
		if ($('#musicLibrary').library('getSelectetLeftTabIndex') === GRID_TAB) {
			viewType = "musicLibraryContentGrid";
		} else {
			viewType = "musicLibraryContentList";
		}
		$('#musicLibrary').library("changeContentClass", viewType);
		var mediaContainerItemsElement = '<div id="mediaContentList" data-bind="template: { name: \'mediaContentItemTemplate\', foreach: MultimediaLibrary.remoteContent.mediaContainerItemsComputed }"></div>';
		$(mediaContainerItemsElement).appendTo($('.' + viewType));
		ko.applyBindings(MultimediaLibrary.remoteContent);
	},
	/**
	 * In case the supplied media object is type of container the method browses
	 * and shows the content of container, shows a navigation bar containing the
	 * title of selected container and back button to navigate back in hierarchy
	 * of opened containers. Otherwise it closes the library and starts playing
	 * video/audio or show the image.
	 *
	 * @method selectRemoteContent {}
	 * @param mediaItem {MediaObject} Media container or media item to be
	 *         opened.
	 */
	selectRemoteContent : function(mediaItem) {
		"use strict";
		if (!!mediaItem) {
			MultimediaLibrary.remoteContent.selectMediaContainerItem(mediaItem);
			if (mediaItem.type === "CONTAINER") {
				var textTitle = "FOLDER";
				var mediaContainersLength = MultimediaLibrary.remoteContent.mediaContainers().length;
				if (mediaContainersLength) {
					if (mediaContainersLength > 2) {
						textTitle = MultimediaLibrary.remoteContent.mediaContainers()[mediaContainersLength - 2].title.toUpperCase();
					} else {
						textTitle = MultimediaLibrary.remoteContent.selectedMediaSource().friendlyName.toUpperCase();
					}
				}
				var subpanelModel = {
					action : function() {
						MultimediaLibrary.goBackRemoteContent();
					},
					actionName : "BACK",
					textTitle : textTitle,
					textSubtitle : mediaItem.title ? mediaItem.title.toUpperCase() : "-"
				};
				$('#musicLibrary').library("subpanelContentTemplateCompile", subpanelModel);
			} else {
				$('#playerWrapper').audioAPI('playPause', false);
				var index;
				switch (mediaItem.type) {
				case MultimediaLibrary.localContent.audioType:
					MultimediaLibrary.showAudio();
					var audioContent = MultimediaLibrary.remoteContent.getAudioFromSelectedContainer();
					index = audioContent.indexOf(mediaItem);
					MultimediaLibrary.carousel.loadMediaContent(audioContent, index);
					$('#multimediaPlayer').audioAPI('playAudioContent', audioContent, index, true, mediaItem.type);
					MultimediaLibrary.hide();
					break;
				case MultimediaLibrary.localContent.videoType:
					MultimediaLibrary.showVideo();
					var videoContent = MultimediaLibrary.remoteContent.getVideoFromSelectedContainer();
					index = videoContent.indexOf(mediaItem);
					$('#multimediaPlayer').audioAPI('playAudioContent', videoContent, index, true, mediaItem.type);
					MultimediaLibrary.hide();
					break;
				default:
					console.log("Media type not supported!");
					break;
				}
			}
		}
	},
	/**
	 * Navigates user back in hierarchy of opened containers/servers.
	 *
	 * @method goBackRemoteContent
	 */
	goBackRemoteContent : function() {
		"use strict";
		if (MultimediaLibrary.remoteContent.mediaContainers().length > 1) {
			MultimediaLibrary.remoteContent.mediaContainers.pop();
			var remoteContent = MultimediaLibrary.remoteContent.mediaContainers.pop();
			if (remoteContent.title.toString().toLowerCase().trim() !== "root") {
				MultimediaLibrary.selectRemoteContent(remoteContent);
			} else {
				MultimediaLibrary.selectRemoteMediaSource(MultimediaLibrary.remoteContent.selectedMediaSource());
			}
		} else {
			MultimediaLibrary.showMediaSources();
		}
	},
	/**
	 * Loads and displays selected local content based on the given content data.
	 *
	 * @method selectLocalMediaContent
	 * @param content {object} media content
	 */
	selectLocalMediaContent : function(content) {
		"use strict";
		if (!!content) {
			var index;
			switch (content.type) {
			case MultimediaLibrary.localContent.audioType:
				MultimediaLibrary.showAudio();
				var audioContent = MultimediaLibrary.localContent.getSelectedLocalContent(content.type);
				index = audioContent.indexOf(content);
				MultimediaLibrary.carousel.loadMediaContent(audioContent, index);
				$('#multimediaPlayer').audioAPI('playAudioContent', audioContent, index, true, content.type);
				MultimediaLibrary.hide();
				break;
			case MultimediaLibrary.localContent.videoType:
				MultimediaLibrary.showVideo();
				var videoContent = MultimediaLibrary.localContent.getSelectedLocalContent(content.type);
				index = videoContent.indexOf(content);
				$('#multimediaPlayer').audioAPI('playAudioContent', videoContent, index, true, content.type);
				MultimediaLibrary.hide();
				break;
			default:
				console.log("Not supported type!");
				break;
			}
		}
	},
	/**
	 * Displays audio player, hides video player.
	 *
	 * @method showAudio
	 */
	showAudio : function() {
		"use strict";
		$("#videoPlayer").css({
			display : "none"
		});
		$("#audioPlayer").css({
			display : "block"
		});
		$("#carouselWrapper").css({
			display : "block"
		});
	},
	/**
	 * Displays video player, hides audio player.
	 *
	 * @method showVideo
	 */
	showVideo : function() {
		"use strict";
		$("#audioPlayer").css({
			display : "none"
		});
		$("#carouselWrapper").css({
			display : "none"
		});
		$("#videoPlayer").css({
			display : "block"
		});
	},

	/**
	 * Sets the local content for MultiMedia library based on the given content.
	 *
	 * @method selectLocalContent
	 * @param content {Object} media content
	 */
	selectLocalContent : function(content) {
		"use strict";
		console.log(content);
		var self = this;

		var subpanelModel;

		if (MultimediaLibrary.localContent.history().length) {
			var title = MultimediaLibrary.localContent.history()[MultimediaLibrary.localContent.history().length - 1].title;
			subpanelModel = {
				action : function() {
					MultimediaLibrary.goBackLocalContent();
				},
				actionName : "BACK",
				textTitle : title.toUpperCase(),
				textSubtitle : content.title ? content.title.toUpperCase() : "-"
			};
		} else {
			subpanelModel = {
				action : function() {
					MultimediaLibrary.goBackLocalContent();
				},
				actionName : "BACK",
				textTitle : "LOCAL",
				textSubtitle : content.title ? content.title.toUpperCase() : "-"
			};
		}
		$('#musicLibrary').library("subpanelContentTemplateCompile", subpanelModel);

		MultimediaLibrary.localContent.pushToHistory(content);

		switch (content.operation) {
		case "browse_category":
			MultimediaLibrary.mediaContentTemplate("localContentSubCategoryItemTemplate");
			MultimediaLibrary.localContent.fillSubCategories(content);
			break;
		case "browse_artists":
			MultimediaLibrary.mediaContentTemplate("localContentArtistItemTemplate");
			MultimediaLibrary.localContent.fillArtists(content);
			break;
		case "browse_artist":
			MultimediaLibrary.mediaContentTemplate("localContentAlbumItemTemplate");
			MultimediaLibrary.localContent.fillArtistAlbums(content);
			break;
		case "browse_album":
			MultimediaLibrary.mediaContentTemplate("localContentAudioVideoItemTemplate");
			MultimediaLibrary.localContent.fillArtistAlbumContent(content);
			break;
		case "browse_albums":
			MultimediaLibrary.mediaContentTemplate("localContentAlbumItemTemplate");
			MultimediaLibrary.localContent.fillAlbums(content);
			break;
		case "browse_all":
			MultimediaLibrary.mediaContentTemplate("localContentAudioVideoItemTemplate");
			MultimediaLibrary.localContent.fillAll(content);
			break;
		default:
			break;
		}
	},
	/**
	 * Navigates user back in history of opened local content.
	 *
	 * @method goBackLocalContent
	 */
	goBackLocalContent : function() {
		"use strict";
		if (MultimediaLibrary.localContent.history().length > 1) {
			MultimediaLibrary.localContent.history.pop();
			var localContent = MultimediaLibrary.localContent.history.pop();
			MultimediaLibrary.selectLocalContent(localContent);
		} else {
			MultimediaLibrary.showLocalContent();
		}
	}
};