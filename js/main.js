/*global MultimediaLibrary, Utils*/

/**
 * Multimedia player application allows user to play back audio and video content from local sources via
 * [tizen.content API](https://developer.tizen.org/dev-guide/2.2.1/org.tizen.web.device.apireference/tizen/content.html) and
 * remote DLNA content via [IVI WRT MediaServer API](https://review.tizen.org/git/?p=profile/ivi/wrt-plugins-ivi.git;a=tree;f=src/MediaServer).
 * Application uses HTML5 [audio](http://www.w3.org/wiki/HTML/Elements/audio) and [video](http://www.w3.org/wiki/HTML/Elements/video) elements
 * to playback content from sources.
 *
 * Upper part of application contains a media content carousel (carouFredSel) in case audio content is selected or a rendered video (HTML5 video element).
 *
 * Lower part of application contains basic information about played audio/video content like thumbnail, title, artist name, album name, duration and controls like play, pause, next, previous, volume.
 * Additionaly Multimedia player application can be controlled using speech recognition via {{#crossLink "Speech"}}{{/crossLink}} component.
 *
 * Audio/video content to be played can be selected from {{#crossLink "MultimediaLibrary"}}{{/crossLink}} component. Playback of audio and video content is controlled by {{#crossLink "AudioPlayer"}}{{/crossLink}} component.
 *
 * Hover and click on elements in images below to navigate to components of Multimedia Player application.
 *
 * <img id="Image-Maps_1201312180420487" src="../assets/img/music.png" usemap="#Image-Maps_1201312180420487" border="0" width="649" height="1152" alt="" />
 *   <map id="_Image-Maps_1201312180420487" name="Image-Maps_1201312180420487">
 *     <area shape="rect" coords="0,0,573,78" href="../classes/TopBarIcons.html" alt="top bar icons" title="Top bar icons" />
 *     <area shape="rect" coords="0,77,644,132" href="../classes/Clock.html" alt="clock" title="Clock"    />
 *     <area shape="rect" coords="0,994,644,1147" href="../classes/BottomPanel.html" alt="bottom panel" title="Bottom panel" />
 *     <area shape="rect" coords="573,1,644,76" href="../modules/Settings.html" alt="Settings" title="Settings"    />
 *     <area  shape="rect" coords="512,135,648,181" href="../classes/MultimediaLibrary.html" alt="Multimedia library" title="Multimedia library" />
 *     <area  shape="rect" coords="0,206,648,476" href="../classes/Carousel.html" alt="Multimedia carousel" title="Multimedia Carousel" />
 *     <area  shape="rect" coords="21,823,634,885" href="../classes/AudioPlayer.html#method_setVolumeControlSelector" alt="Volume control" title="Volume control" />
 *     <area  shape="rect" coords="23,890,636,961" href="../classes/AudioPlayer.html#method_setControlButtonsSelector" alt="Control buttons" title="Control buttons" />
 *     <area  shape="rect" coords="298,530,612,585" href="../classes/AudioPlayer.html#method_setTimeProgressBarSelector" alt="Time progress bar" title="Time progress bar" />
 *     <area  shape="rect" coords="297,589,611,721" href="../classes/AudioPlayer.html#method_setInfoPanelSelector" alt="Info panel" title="Info panel" />
 *     <area  shape="rect" coords="267,725,626,818" href="../classes/AudioPlayer.html#method_setSpectrumAnalyzerSelector" alt="Spectrum analyzer" title="Spectrum analyzer" />
 *     <area  shape="rect" coords="45,517,267,738" href="../classes/AudioPlayer.html#method_setThumbnailSelector" alt="Thumbnail" title="Thumbnail" />
 *   </map>
 *
 * @module MultimediaPlayerApplication
 * @main MultimediaPlayerApplication
 * @class MultimediaPlayer
 */

 /**
 * Adds the listener object to receive notifications when the speech recognizer returns a speech command to control multimedia player: PLAY, STOP, NEXT, PREVIOUS.
 *
 * @method initVoiceRecognition
 */
var initVoiceRecognition = function() {
    "use strict";
    /* global Speech */
    if (typeof (Speech) !== 'undefined') {
        Speech.addVoiceRecognitionListener({
            onplay : function() {
                $('#multimediaPlayer').audioAPI('playPause', true);
            },
            onstop : function() {
                $('#multimediaPlayer').audioAPI('playPause', false);
            },
            onnext : function() {
                $('#multimediaPlayer').audioAPI('next');
                $('#multimediaPlayer').audioAPI('playPause', true);
            },
            onprevious : function() {
                $('#multimediaPlayer').audioAPI('previous');
                $('#multimediaPlayer').audioAPI('playPause', true);
            }
        });
    } else {
        console.warn("Speech API is not available.");
    }
};

/**
 * Method which provides methods to initialize UI and create listener for
 * changing themes of music player.
 *
 * @method init
 * @constructor
 */
var bootstrap;
var init = function() {
    "use strict";
    /*global Bootstrap */
    bootstrap = new Bootstrap(function(status) {
        $("#libraryButton").on("click", function() {
            MultimediaLibrary.show();
        });

        $("#videoPlayer").on("click", function() {
            Utils.launchFullScreen(this);
        });

        $("#topBarIcons").topBarIconsPlugin('init');
        $("#clockElement").ClockPlugin('init', 5);
        $("#clockElement").ClockPlugin('startTimer');
        $('#bottomPanel').bottomPanel('init');

        $('#multimediaPlayer').audioAPI('setControlButtonsSelector', '#controlButtons');
        $('#multimediaPlayer').audioAPI('setTimeProgressBarSelector', '#timeBar');
        $('#multimediaPlayer').audioAPI('setSpectrumAnalyzerSelector', '#spectAnalyzer');
        $('#multimediaPlayer').audioAPI('setInfoPanelSelector', '#infoPanel');
        $('#multimediaPlayer').audioAPI('setThumbnailSelector', '#thumbnail');
        $('#multimediaPlayer').audioAPI('setVolumeControlSelector', '.noVolumeSlider');
        $('#multimediaPlayer').audioAPI('init', [], "#audioPlayer", "#videoPlayer");

        MultimediaLibrary.init();
        initVoiceRecognition();
    });
};

$(document).ready(function() {
    "use strict";
    // debug mode - window.setTimeout("init()", 20000);
    init();
});
