/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals Mousetrap, initI18N, $, isWeb, sendMessageToHost, getParameterByName, RTFJS, setContent */
'use strict';

sendMessageToHost({ command: 'loadDefaultTextContent' });

let $rtfContent;

$(document).ready(() => {
  const locale = getParameterByName('locale');
  // const filePath = getParameterByName('file');
  // const searchQuery = getParameterByName('query');
  let extSettings;

  initI18N(locale, 'ns.viewerRTF.json');
  loadExtSettings();

  $rtfContent = $('#rtfContent');

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

  $rtfContent.removeClass();
  $rtfContent.addClass('markdown ' + zoomSteps[currentZoomState]);

  $('#zoomInButton').off();
  $('#zoomInButton').on('click', () => {
    currentZoomState += 1;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $rtfContent.removeClass();
    $rtfContent.addClass('markdown ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomOutButton').off();
  $('#zoomOutButton').on('click', () => {
    currentZoomState -= 1;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $rtfContent.removeClass();
    $rtfContent.addClass('markdown ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $('#zoomResetButton').off();
  $('#zoomResetButton').on('click', () => {
    currentZoomState = 3;
    $rtfContent.removeClass();
    $rtfContent.addClass('markdown ' + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  function saveExtSettings() {
    const settings = {
      zoomState: currentZoomState
    };
    localStorage.setItem('viewerHTMLSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerHTMLSettings'));
  }
});

// fixing embedding of local images
function fixingEmbeddingOfLocalImages($rtfContentPar, fileDirectory) {
  const hasURLProtocol = url =>
    url.indexOf('http://') === 0 ||
    url.indexOf('https://') === 0 ||
    url.indexOf('file://') === 0 ||
    url.indexOf('data:') === 0;

  $rtfContentPar.find('img[src]').each((index, link) => {
    const currentSrc = $(link).attr('src');
    if (!hasURLProtocol(currentSrc)) {
      const path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      $(link).attr('src', path);
    }
  });

  /* $rtfContentPar.find('a[href]').each((index, link) => {
    let currentSrc = $(link).attr('href');
    let path;

    if (!hasURLProtocol(currentSrc)) {
      const path1 = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      $(link).attr('href', path1);
    }

    $(link).off();
    $(link).on('click', e => {
      e.preventDefault();
      if (path) {
        currentSrc = encodeURIComponent(path);
      }
      const msg = { command: 'openLinkExternally', link: currentSrc };
      sendMessageToHost(msg);
    });
  }); */
}

function stringToBinaryArray(string) {
  const buffer = new ArrayBuffer(string.length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < string.length; i += 1) {
    bufferView[i] = string.charCodeAt(i);
  }
  return buffer;
}

function setPictBorder(elem, show) {
  return elem.css('border', show ? '1px dotted red' : 'none');
}

function setUnsafeLink(elem, warn) {
  return elem.css('border', warn ? '1px dashed red' : 'none');
}

function displayRtfFile(blob) {
  try {
    const showPicBorder = $('#showpicborder').prop('checked');
    const warnHttpLinks = $('#warnhttplink').prop('checked');
    const settings = {
      onPicture: create => {
        const elem = create().attr('class', 'rtfpict'); // WHY does addClass not work on <svg>?!
        return setPictBorder(elem, showPicBorder);
      },
      onHyperlink: (create, hyperlink) => {
        const url = hyperlink.url();
        const lnk = create();
        const span = setUnsafeLink(
          $('<span>')
            .addClass('unsafelink')
            .append(lnk),
          warnHttpLinks
        );
        span.click(evt => {
          evt.preventDefault();
          sendMessageToHost({ command: 'openLinkExternally', link: url });
        });
        return {
          content: lnk,
          element: span
        };
      }
    };
    const doc = new RTFJS.Document(blob, settings);
    let haveMeta = false;
    const meta = doc.metadata();
    for (let prop in meta) {
      console.log(meta);
      $('#rtfContent').append(
        $('<div>')
          .append($('<span>').text(prop + ': '))
          .append($('<span>').text(meta[prop].toString()))
      );
      haveMeta = true;
    }
    if (haveMeta) {
      $('#havemeta').show();
    }
    $('#rtfContent')
      .empty()
      .append(doc.render());
    $('#closebutton').show();
    $('#tools').show();
    console.log('All done!');
  } catch (e) {
    if (e instanceof RTFJS.Error) {
      console.log('Error: ' + e.message);
      $('#content').text('Error: ' + e.message);
    } else {
      throw e;
    }
  }
}

function setContent(content, fileDir) {
  $rtfContent = $('#rtfContent');

  displayRtfFile(stringToBinaryArray(content));

  let fileDirectory = fileDir;
  if (fileDirectory.indexOf('file://') === 0) {
    fileDirectory = fileDirectory.substring(
      'file://'.length,
      fileDirectory.length
    );
  }

  fixingEmbeddingOfLocalImages($rtfContent, fileDirectory);

  /* Mousetrap.bind(['command++', 'ctrl++'], (e) => {
    increaseFont();
    return false;
  });

  Mousetrap.bind(['command+-', 'ctrl+-'], (e) => {
    decreaseFont();
    return false;
  }); */
}
