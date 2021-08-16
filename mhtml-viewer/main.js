/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* global define MailParser, DOMPurify, Readability */
/* globals marked, MailParser, Mousetrap */

'use strict';
sendMessageToHost({ command: 'loadDefaultTextContent' });

let readabilityContent;
let cleanedHTML;
let mhtmlViewer;
const fontSize = 14;

function setContent(content, filePathURI) {
  //console.log('MHTML Content: '+content);
  const mhtparser = new mailparser.MailParser();
  mhtparser.on('end', function(mail_object) {
    //console.log('mail_object:', mail_object);

    const contLocation = /^content-location:(.*$)/im.exec(content);
    mail_object.contentLocation =
      contLocation && contLocation.length > 0 ? contLocation[1] : 'not found';
    cleanedHTML = DOMPurify.sanitize(mail_object.html);

    updateHTMLContent($('#mhtmlViewer'), cleanedHTML, filePathURI);

    $('#fileMeta').text('saved on ' + mail_object.headers.date);

    // View readability mode

    try {
      const documentClone = document.cloneNode(true);
      const article = new Readability(document.baseURI, documentClone).parse();
      readabilityContent = article.content;
    } catch (e) {
      console.log('Error handling' + e);
      const msg = {
        command: 'showAlertDialog',
        title: 'Readability Mode',
        message: 'This content can not be loaded.'
      };
      sendMessageToHost(msg);
    }

    if (readabilityContent) {
      updateHTMLContent($('#mhtmlViewer'), readabilityContent, filePathURI);
    }

    mhtmlViewer = document.getElementById('mhtmlViewer');
    mhtmlViewer.style.fontSize = fontSize; //'large';
    mhtmlViewer.style.fontFamily = 'Helvetica, Arial, sans-serif';
    mhtmlViewer.style.background = '#ffffff';
    mhtmlViewer.style.color = '';

    init(filePathURI, mail_object);
  });

  mhtparser.write(content);
  mhtparser.end();
}

// fixing embedding of local images
function fixingEmbeddingOfLocalImages($htmlContent, fileDirectory) {
  const hasURLProtocol = url => {
    return (
      url.indexOf('http://') === 0 ||
      url.indexOf('https://') === 0 ||
      url.indexOf('file://') === 0 ||
      url.indexOf('data:') === 0
    );
  };

  $htmlContent.find('img[src]').each((index, link) => {
    const currentSrc = $(link).attr('src');
    if (!hasURLProtocol(currentSrc)) {
      const path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      $(link).attr('src', path);
    }
  });

  $htmlContent.find('a[href]').each((index, link) => {
    let currentSrc = $(link).attr('href');
    let path;

    if (currentSrc.indexOf('#') === 0) {
      // Leave the default link behaviour by internal links
    } else {
      if (!hasURLProtocol(currentSrc)) {
        const path =
          (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
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

function updateHTMLContent($targetElement, content, fileDirectory) {
  $targetElement.html(content);
  fixingEmbeddingOfLocalImages($targetElement, fileDirectory);
}

function init(filePathURI, objectlocation) {
  let $htmlContent;

  const locale = getParameterByName('locale');
  initI18N(locale, 'ns.viewerMHTML.json');

  let extSettings;
  loadExtSettings();

  $htmlContent = $('#mhtmlViewer');

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

  $htmlContent.removeClass();
  $htmlContent.addClass(
    'markdown ' + styles[currentStyleIndex] + ' ' + zoomSteps[currentZoomState]
  );

  // Menu: hide readability items
  $('#toSansSerifFont').show();
  $('#toSerifFont').show();
  $('#increasingFontSize').show();
  $('#decreasingFontSize').show();
  $('#readabilityOn').hide();
  $('#changeStyleButton').hide();
  $('#resetStyleButton').hide();

  //hide zoom operation menu items because they don't influence on the style
  $('#zoomInButton').hide();
  $('#zoomOutButton').hide();
  $('#zoomResetButton').hide();

  $('#zoomInButton').off();
  $('#zoomInButton').on('click', () => {
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#zoomOutButton').off();
  $('#zoomOutButton').on('click', () => {
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#zoomResetButton').off();
  $('#zoomResetButton').on('click', () => {
    currentZoomState = 3;
    $htmlContent.removeClass();
    $htmlContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#openInNewWindowButton').off();
  $('#openInNewWindowButton').on('click', () => {
    window.parent.open(filePathURI, '_blank'); // , 'nodeIntegration=0'
  });

  $('#openURLButton').off();
  $('#openURLButton').on('click', () => {
    const msg = {
      command: 'openLinkExternally',
      link: objectlocation.contentLocation.trim()
    };
    sendMessageToHost(msg);
  });

  $('#toSansSerifFont').off();
  $('#toSansSerifFont').on('click', e => {
    e.stopPropagation();
    $htmlContent[0].style.fontFamily = 'Helvetica, Arial, sans-serif';
  });

  $('#toSerifFont').off();
  $('#toSerifFont').on('click', e => {
    e.stopPropagation();
    $htmlContent[0].style.fontFamily = 'Georgia, Times New Roman, serif';
  });

  $('#increasingFontSize').off();
  $('#increasingFontSize').on('click', e => {
    e.stopPropagation();
    increaseFont();
  });

  $('#decreasingFontSize').off();
  $('#decreasingFontSize').on('click', e => {
    e.stopPropagation();
    decreaseFont();
  });

  $('#whiteBackgroundColor').off();
  $('#whiteBackgroundColor').on('click', e => {
    e.stopPropagation();
    $htmlContent[0].style.background = '#ffffff';
    $htmlContent[0].style.color = '';
  });

  $('#blackBackgroundColor').off();
  $('#blackBackgroundColor').on('click', e => {
    e.stopPropagation();
    $htmlContent[0].style.background = '#282a36';
    $htmlContent[0].style.color = '#ffffff';
  });

  $('#sepiaBackgroundColor').off();
  $('#sepiaBackgroundColor').on('click', e => {
    e.stopPropagation();
    $htmlContent[0].style.color = '#5b4636';
    $htmlContent[0].style.background = '#f4ecd8';
  });

  $('#changeStyleButton').off();
  $('#changeStyleButton').on('click', () => {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#resetStyleButton').off();
  $('#resetStyleButton').on('click', () => {
    currentStyleIndex = 0;
    //currentZoomState = 5;
    $htmlContent.removeClass();
    $htmlContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#readabilityOn').off();
  $('#readabilityOn').on('click', () => {
    if (readabilityContent) {
      updateHTMLContent($('#mhtmlViewer'), readabilityContent);
    }
    //if ($('#mhtmlViewer').data('clicked', true)) {
    $('#toSerifFont').show();
    $('#toSansSerifFont').show();
    $('#increasingFontSize').show();
    $('#decreasingFontSize').show();
    $('#readabilityOff').show();
    $('#whiteBackgroundColor').show();
    $('#blackBackgroundColor').show();
    $('#sepiaBackgroundColor').show();
    $('#themeStyle').show();
    $('#readabilityFont').show();
    $('#readabilityFontSize').show();
    $('#readabilityOn').hide();
    $('#changeStyleButton').hide();
    $('#resetStyleButton').hide();
    //}
  });

  $('#readabilityOff').off();
  $('#readabilityOff').on('click', () => {
    updateHTMLContent($('#mhtmlViewer'), cleanedHTML);
    mhtmlViewer.style.fontSize = '';
    mhtmlViewer.style.fontFamily = '';
    mhtmlViewer.style.color = '';
    mhtmlViewer.style.background = '';
    $('#readabilityOff').hide();
    $('#toSerifFont').hide();
    $('#toSansSerifFont').hide();
    $('#increasingFontSize').hide();
    $('#decreasingFontSize').hide();
    $('#whiteBackgroundColor').hide();
    $('#blackBackgroundColor').hide();
    $('#sepiaBackgroundColor').hide();
    $('#themeStyle').hide();
    $('#readabilityFont').hide();
    $('#readabilityFontSize').hide();
    $('#readabilityOn').show();
    $('#changeStyleButton').show();
    $('#resetStyleButton').show();
  });

  function increaseFont() {
    const style = window
      .getComputedStyle($htmlContent[0], null)
      .getPropertyValue('font-size');
    const fontSize = parseFloat(style);
    $htmlContent[0].style.fontSize = fontSize + 1 + 'px';
  }

  function decreaseFont() {
    const style = window
      .getComputedStyle($htmlContent[0], null)
      .getPropertyValue('font-size');
    const fontSize = parseFloat(style);
    $htmlContent[0].style.fontSize = fontSize - 1 + 'px';
  }

  Mousetrap.bind(['command++', 'ctrl++'], () => {
    increaseFont();
    return false;
  });

  Mousetrap.bind(['command+-', 'ctrl+-'], () => {
    decreaseFont();
    return false;
  });

  function saveExtSettings() {
    const settings = {
      styleIndex: currentStyleIndex,
      zoomState: currentZoomState
    };
    localStorage.setItem('viewerMHTMLSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerMHTMLSettings'));
  }
}
