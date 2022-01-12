/* eslint-disable prefer-destructuring */
/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals plyr, initI18N, getParameterByName, $, sendMessageToHost */

let player;
let resume;

function togglePlay() {
  if (!player) {
    return;
  }
  if (resume) {
    resume = false;
    player.play();
  } else {
    resume = true;
    player.pause();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const filePath = getParameterByName('file');
  // const ext = filePath.split('.').pop().toLowerCase();
  // const extensionSupportedFileTypesAudio = ['mp3', 'ogg', 'flac'];
  // const extensionSupportedFileTypesVideo = ['mp4', 'webm', 'ogv', 'm4v'];
  let autoPlayEnabled = true;
  let enableVideoOutput = true;
  let loop = 'loopAll'; // loopOne, noLoop, loopAll

  // const locale = getParameterByName('locale');
  initI18N('en_US', 'ns.viewerAudioVideo.json');

  loadExtSettings();
  initPlayer();
  initMenu();

  function initPlayer() {
    const options = {
      controls: [
        'play-large', // The large play button in the center
        'restart', // Restart playback
        'rewind', // Rewind by the seek time (default 10 seconds)
        'play', // Play/pause playback
        'fast-forward', // Fast forward by the seek time (default 10 seconds)
        'progress', // The progress bar and scrubber for playback and buffering
        'current-time', // The current time of playback
        // 'duration', // The full duration of the media
        'mute', // Toggle mute
        'volume', // Volume control
        // 'captions', // Toggle captions
        // 'settings', // Settings menu
        'pip' // Picture-in-picture (currently Safari only)
        // 'airplay', // Airplay (currently Safari only)
        // 'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
        // 'fullscreen', // Toggle fullscreen
      ],
      title: 'TagSpaces',
      // tooltips: {
      //   controls: true
      // },
      displayDuration: true,
      autoplay: autoPlayEnabled,
      captions: {
        defaultActive: true
      },
      hideControls: false, //  enableVideoOutput,
      keyboard: { focused: true, global: true },
      fullscreen: { enabled: false }
    };

    const fileSource = enableVideoOutput
      ? $('<video controls id="player">')
      : $('<audio controls id="player">');
    // if (extensionSupportedFileTypesAudio.indexOf(ext) !== -1) {
    //   fileSource = $('<audio controls id="player">');
    // }
    fileSource.append('<source>').attr('src', filePath);
    $(document)
      .find('.js-plyr')
      .append(fileSource);

    if (enableVideoOutput) {
      $(document)
        .find('.js-plyr')
        .addClass('videoPlayer')
        .removeClass('audioPlayer');
    } else {
      $(document)
        .find('.js-plyr')
        .addClass('audioPlayer')
        .removeClass('videoPlayer');
    }

    player = new Plyr('#player', options);

    player.on('ended', () => {
      if (loop === 'loopOne') {
        player.play();
      } else if (loop === 'noLoop') {
        // player.stop();
      } else {
        sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
      }
    });
  }

  function saveExtSettings() {
    const settings = {
      autoPlayEnabled,
      enableVideoOutput,
      loop
    };
    localStorage.setItem('viewerAudioVideoSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    const extSettings = JSON.parse(
      localStorage.getItem('viewerAudioVideoSettings')
    );
    if (extSettings && extSettings.autoPlayEnabled !== undefined) {
      autoPlayEnabled = extSettings.autoPlayEnabled;
    }

    if (extSettings && extSettings.enableVideoOutput !== undefined) {
      enableVideoOutput = extSettings.enableVideoOutput;
    }
    if (extSettings && extSettings.loop) {
      loop = extSettings.loop;
    }
    // console.log('Settings loaded: ' + JSON.stringify(extSettings));
  }

  function initMenu() {
    if (autoPlayEnabled) {
      $('#enableAutoPlay').hide();
      $('#disableAutoPlay').show();
    } else {
      $('#enableAutoPlay').show();
      $('#disableAutoPlay').hide();
    }

    $('#enableAutoPlay').off();
    $('#enableAutoPlay').on('click', e => {
      e.stopPropagation();
      $('#enableAutoPlay').hide();
      $('#disableAutoPlay').show();
      autoPlayEnabled = true;
      saveExtSettings();
    });

    $('#disableAutoPlay').off();
    $('#disableAutoPlay').on('click', e => {
      e.stopPropagation();
      $('#disableAutoPlay').hide();
      $('#enableAutoPlay').show();
      autoPlayEnabled = false;
      saveExtSettings();
    });

    if (enableVideoOutput) {
      $('#enableVideoOutput').hide();
      $('#disableVideoOutput').show();
    } else {
      $('#enableVideoOutput').show();
      $('#disableVideoOutput').hide();
    }

    $('#disableVideoOutput').off();
    $('#disableVideoOutput').on('click', e => {
      e.stopPropagation();
      $('#disableVideoOutput').hide();
      $('#enableVideoOutput').show();
      enableVideoOutput = false;
      saveExtSettings();
      document.location.reload();
    });

    $('#enableVideoOutput').off();
    $('#enableVideoOutput').on('click', e => {
      e.stopPropagation();
      $('#enableVideoOutput').hide();
      $('#disableVideoOutput').show();
      enableVideoOutput = true;
      saveExtSettings();
      document.location.reload();
    });

    switch (loop) {
      case 'loopAll':
        $('#loopAll .fa')
          .removeClass('fa-circle-o')
          .addClass('fa-check-circle-o');
        $('#loopOne .fa')
          .removeClass('fa-check-circle-o')
          .addClass('fa-circle-o');
        $('#noLoop .fa')
          .removeClass('fa-check-circle-o')
          .addClass('fa-circle-o');
        break;
      case 'loopOne':
        $('#loopAll .fa')
          .removeClass('fa-check-circle-o')
          .addClass('fa-circle-o');
        $('#loopOne .fa')
          .removeClass('fa-circle-o')
          .addClass('fa-check-circle-o');
        $('#noLoop .fa')
          .removeClass('fa-check-circle-o')
          .addClass('fa-circle-o');
        break;
      case 'noLoop':
        $('#loopAll .fa')
          .removeClass('fa-check-circle-o')
          .addClass('fa-circle-o');
        $('#loopOne .fa')
          .removeClass('fa-check-circle-o')
          .addClass('fa-circle-o');
        $('#noLoop .fa')
          .removeClass('fa-circle-o')
          .addClass('fa-check-circle-o');
        break;
      default:
        break;
    }

    $('#loopAll').off();
    $('#loopAll').on('click', e => {
      e.stopPropagation();
      $('#loopAll .fa')
        .removeClass('fa-circle-o')
        .addClass('fa-check-circle-o');
      $('#loopOne .fa')
        .removeClass('fa-check-circle-o')
        .addClass('fa-circle-o');
      $('#noLoop .fa')
        .removeClass('fa-check-circle-o')
        .addClass('fa-circle-o');
      loop = 'loopAll';
      saveExtSettings();
    });

    $('#loopOne').off();
    $('#loopOne').on('click', e => {
      e.stopPropagation();
      $('#loopAll .fa')
        .removeClass('fa-check-circle-o')
        .addClass('fa-circle-o');
      $('#loopOne .fa')
        .removeClass('fa-circle-o')
        .addClass('fa-check-circle-o');
      $('#noLoop .fa')
        .removeClass('fa-check-circle-o')
        .addClass('fa-circle-o');
      loop = 'loopOne';
      saveExtSettings();
    });

    $('#noLoop').off();
    $('#noLoop').on('click', e => {
      e.stopPropagation();
      $('#loopAll .fa')
        .removeClass('fa-check-circle-o')
        .addClass('fa-circle-o');
      $('#loopOne .fa')
        .removeClass('fa-check-circle-o')
        .addClass('fa-circle-o');
      $('#noLoop .fa')
        .removeClass('fa-circle-o')
        .addClass('fa-check-circle-o');
      loop = 'noLoop';
      saveExtSettings();
    });
  }
});
