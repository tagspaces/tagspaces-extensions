/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals marked, initI18N, getParameterByName, $, sendMessageToHost, isWeb */

'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent' });

let $mdContent;

$(() => {
  const filepath = getParameterByName('file');

  marked.setOptions({
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    xhtml: true
  });

  let extSettings;
  loadExtSettings();

  $(document).dblclick(() => {
    sendMessageToHost({ command: 'editDocument' });
  });

  let locale = getParameterByName('locale');
  if (locale === 'en') {
    locale = 'en_US';
  }
  initI18N(locale, 'ns.viewerMD.json');

  $mdContent = $('#mdContent');

  const styles = [
    '',
    'solarized-dark',
    'github',
    'metro-vibes',
    'clearness',
    'clearness-dark'
  ];
  let currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  const zoomSteps = [
    'zoomSmallest',
    'zoomSmaller',
    'zoomSmall',
    'zoomDefault',
    'zoomLarge',
    'zoomLarger',
    'zoomLargest'
  ];
  let currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $mdContent.removeClass();
  $mdContent.addClass(
    'markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]
  );

  $('#changeStyleButton').bind('click', () => {
    currentStyleIndex += 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $mdContent.removeClass();
    $mdContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#resetStyleButton').bind('click', () => {
    currentStyleIndex = 0;
    $mdContent.removeClass();
    $mdContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#zoomInButton').bind('click', () => {
    currentZoomState += 1;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $mdContent.removeClass();
    $mdContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#zoomOutButton').bind('click', () => {
    currentZoomState -= 1;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $mdContent.removeClass();
    $mdContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#zoomResetButton').bind('click', () => {
    currentZoomState = 3;
    $mdContent.removeClass();
    $mdContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  function saveExtSettings() {
    const settings = {
      styleIndex: currentStyleIndex,
      zoomState: currentZoomState
    };
    localStorage.setItem('viewerMDSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerMDSettings'));
  }
});

function setContent(content, fileDirectory) {
  $mdContent = $('#mdContent');
  const UTF8_BOM = '\ufeff';
  if (content.startsWith(UTF8_BOM)) {
    // Cleaning BOM character
    content = content.substr(1);
  }

  content = marked(content);
  $mdContent.empty().append(content);

  // $('base').attr('href', fileDirectory + '//');

  if (fileDirectory.indexOf('file://') === 0) {
    fileDirectory = fileDirectory.substring(
      'file://'.length,
      fileDirectory.length
    );
  }

  const hasURLProtocol = url => {
    return (
      url.indexOf('http://') === 0 ||
      url.indexOf('https://') === 0 ||
      url.indexOf('file://') === 0 ||
      url.indexOf('data:') === 0
    );
  };

  // fixing embedding of local image, audio and video files
  $mdContent.find('img[src], source[src]').each((index, link) => {
    const currentSrc = $(link).attr('src');
    if (!hasURLProtocol(currentSrc)) {
      const path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      $(link).attr('src', path);
    }
  });

  $mdContent.find('a[href]').each((index, link) => {
    let currentSrc = $(link).attr('href');
    let path;

    if (currentSrc.indexOf('#') === 0) {
      // Leave the default link behaviour by internal links
    } else {
      if (!hasURLProtocol(currentSrc)) {
        path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
        $(link).attr('href', path);
      }

      $(link).off();
      $(link).on('click', e => {
        e.preventDefault();
        if (path) {
          currentSrc = encodeURIComponent(path);
        }

        sendMessageToHost({ command: 'openLinkExternally', link: currentSrc });
      });
    }
  });
}
