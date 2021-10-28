/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */
/* globals initI18N, getParameterByName, $, sendMessageToHost, isWeb */

sendMessageToHost({ command: 'loadDefaultTextContent' });

let $htmlContent;
let sourceURL;
let screenshot;
let scrappedon;

$(document).dblclick(() => {
  sendMessageToHost({ command: 'editDocument' });
});

$(() => {
  let locale = getParameterByName('locale');
  if (locale === 'en') {
    locale = 'en_US';
  }
  initI18N(locale, 'ns.viewerHTML.json');

  const searchQuery = getParameterByName('query');

  let extSettings;
  loadExtSettings();

  $htmlContent = $('#htmlContent');

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
    $htmlContent.removeClass();
    $htmlContent.addClass(
      'markdown ' +
        styles[currentStyleIndex] +
        ' ' +
        zoomSteps[currentZoomState]
    );
    saveExtSettings();
  });

  $('#zoomInButton').off();
  $('#zoomInButton').on('click', () => {
    currentZoomState += 1;
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
    currentZoomState -= 1;
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

  function saveExtSettings() {
    const settings = {
      styleIndex: currentStyleIndex,
      zoomState: currentZoomState
    };
    localStorage.setItem('viewerHTMLSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerHTMLSettings'));
  }

  // Menu: hide readability items
  $('#readabilityFont').hide();
  $('#readabilityFontSize').hide();
  $('#themeStyle').hide();
  $('#readabilityOff').hide();
});

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
      // Leave the default link behavior by internal links
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

function setContent(content, fileDirectory) {
  const bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m; // jshint ignore:line
  let bodyContent;

  try {
    bodyContent = content.match(bodyRegex)[1];
  } catch (e) {
    console.log('Error parsing the body of the HTML document. ' + e);
    bodyContent = content;
  }

  // try {
  //  const scrappedOnRegex = /data-scrappedon='([^']*)'/m; // jshint ignore:line
  //  scrappedOn = content.match(scrappedOnRegex)[1];
  // } catch (e) {
  //  console.log('Error parsing the meta from the HTML document. ' + e);
  // }

  const sourceURLRegex = /data-sourceurl="([^"]*)"/m;
  const regex = new RegExp(sourceURLRegex);
  const regexMatcher = content.match(regex);
  sourceURL = regexMatcher ? regexMatcher[1] : undefined;

  const screenshotRegex = /data-screenshot="([^"]*)"/m;
  const regexscreenshot = new RegExp(screenshotRegex);
  const regexMatcherScreenshot = content.match(regexscreenshot);
  screenshot = regexMatcherScreenshot ? regexMatcherScreenshot[1] : undefined;

  const scrappedonRegex = /data-scrappedon="([^"]*)"/m;
  const regexscrappedon = new RegExp(scrappedonRegex);
  const regexMatcherScrappedon = content.match(regexscrappedon);
  scrappedon = regexMatcherScrappedon ? regexMatcherScrappedon[1] : undefined;

  // removing all scripts from the document
  const cleanedBodyContent = bodyContent.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  $htmlContent = $('#htmlContent');
  $htmlContent.empty().append(cleanedBodyContent);

  if (fileDirectory.indexOf('file://') === 0) {
    fileDirectory = fileDirectory.substring(
      'file://'.length,
      fileDirectory.length
    );
  }

  fixingEmbeddingOfLocalImages($htmlContent, fileDirectory);

  // View readability mode
  const readabilityViewer = document.getElementById('htmlContent');
  const fontSize = 14;

  $('#readabilityOn').off();
  $('#readabilityOn').on('click', () => {
    try {
      const documentClone = document.cloneNode(true);
      const article = new Readability(document.baseURI, documentClone).parse();
      $(readabilityViewer).html(article.content);
      fixingEmbeddingOfLocalImages($(readabilityViewer, fileDirectory));
      readabilityViewer.style.fontSize = fontSize; //'large';
      readabilityViewer.style.fontFamily = 'Helvetica, Arial, sans-serif';
      readabilityViewer.style.background = '#ffffff';
      readabilityViewer.style.color = '';
      $('#readabilityOff').css('display', 'inline-block');
      $('#themeStyle').show();
      $('#readabilityFont').show();
      $('#readabilityFontSize').show();
      $('#readabilityOn').hide();
      $('#changeStyleButton').hide();
      $('#resetStyleButton').hide();
      $('#zoomInButton').hide();
      $('#zoomOutButton').hide();
      $('#zoomResetButton').hide();
    } catch (e) {
      console.log('Error handling' + e);
      const msg = {
        command: 'showAlertDialog',
        title: 'Readability Mode',
        message: 'This content can not be loaded.'
      };
      sendMessageToHost(msg);
    }
  });

  $('#readabilityOff').off();
  $('#readabilityOff').on('click', () => {
    $htmlContent.empty();
    $htmlContent.append(cleanedBodyContent);
    fixingEmbeddingOfLocalImages($htmlContent, fileDirectory);
    readabilityViewer.style.fontSize = ''; //'large';
    readabilityViewer.style.fontFamily = '';
    readabilityViewer.style.color = '';
    readabilityViewer.style.background = '';
    $('#readabilityOn').show();
    $('#changeStyleButton').show();
    $('#resetStyleButton').show();
    $('#readabilityOff').hide();
    $('#readabilityFont').hide();
    $('#readabilityFontSize').hide();
    $('#themeStyle').hide();
  });

  $('#toSansSerifFont').off();
  $('#toSansSerifFont').on('click', e => {
    e.stopPropagation();
    readabilityViewer.style.fontFamily = 'Helvetica, Arial, sans-serif';
  });

  $('#toSerifFont').off();
  $('#toSerifFont').on('click', e => {
    e.stopPropagation();
    readabilityViewer.style.fontFamily = 'Georgia, Times New Roman, serif';
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
    readabilityViewer.style.background = '#ffffff';
    readabilityViewer.style.color = '';
  });

  $('#blackBackgroundColor').off();
  $('#blackBackgroundColor').on('click', e => {
    e.stopPropagation();
    readabilityViewer.style.background = '#282a36';
    readabilityViewer.style.color = '#ffffff';
  });

  $('#sepiaBackgroundColor').off();
  $('#sepiaBackgroundColor').on('click', e => {
    e.stopPropagation();
    readabilityViewer.style.color = '#5b4636';
    readabilityViewer.style.background = '#f4ecd8';
  });

  $('#openSourceURL').off();
  $('#openSourceURL').on('click', () => {
    if (sourceURL && sourceURL.length > 0) {
      sendMessageToHost({ command: 'openLinkExternally', link: sourceURL });
    } else {
      sendMessageToHost({
        command: 'showAlertDialog',
        title: 'Error',
        message: 'No source URL found in this file!'
      });
    }
  });

  $('#openSourceURLdateHTML').off();
  $('#openSourceURLdateHTML').on('click', () => {
    if (sourceURL && sourceURL.length > 0) {
      sendMessageToHost({ command: 'openLinkExternally', link: sourceURL });
    } else {
      sendMessageToHost({
        command: 'showAlertDialog',
        title: 'Error',
        message: 'No source URL found in this file!'
      });
    }
  });

  $('#html-data-scrappedon').text(scrappedon);
  $('#html-data-sourceurl').text(sourceURL);
  // $('#html-data-sourceurl').attr('title', sourceURL);
  $('#html-data-screenshot').attr('src', screenshot);

  function increaseFont() {
    try {
      const style = window
        .getComputedStyle(readabilityViewer, null)
        .getPropertyValue('font-size');
      console.log(style);
      console.debug(style);
      const fontSize = parseFloat(style);
      //if($('#readability-page-1').hasClass('page')){
      const page = document.getElementsByClassName('markdown');
      // console.log(page[0].style);
      page[0].style.fontSize = fontSize + 1 + 'px';
      page[0].style[11] = fontSize + 1 + 'px';
      //} else {
      readabilityViewer.style.fontSize = fontSize + 1 + 'px';
      //}
    } catch (e) {
      console.log('Error handling : ' + e);
      console.assert(e);
    }
  }

  function decreaseFont() {
    const style = window
      .getComputedStyle(readabilityViewer, null)
      .getPropertyValue('font-size');
    const fontSize = parseFloat(style);
    readabilityViewer.style.fontSize = fontSize - 1 + 'px';
  }

  Mousetrap.bind(['command++', 'ctrl++'], () => {
    increaseFont();
    return false;
  });

  Mousetrap.bind(['command+-', 'ctrl+-'], () => {
    decreaseFont();
    return false;
  });
}
