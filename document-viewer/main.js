/* Copyright (c) 2018-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals $, sendMessageToHost, getParameterByName, initI18N */

var JSZip, JSZipUtils;
let $documentContent;
const filePath = getParameterByName('file');

$(document).ready(init);

function init() {
  const locale = getParameterByName('locale');
  initI18N(locale, 'ns.viewerDocument.json');

  const searchQuery = getParameterByName('query');

  let extSettings;
  loadExtSettings();

  $documentContent = $('#documentContent');

  const zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  let currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $documentContent.removeClass();
  $documentContent.addClass('markdown ' + zoomSteps[currentZoomState]);

  const options = {
    convertImage: mammoth.images.imgElement((image) => {
      return image.read("base64").then((imageBuffer) => {
        return {
          src: "data:" + image.contentType + ";base64," + imageBuffer
        };
      });
    }),
    styleMap: [
      "p[style-name='Section Title'] => h1:fresh",
      "p[style-name='Subsection Title'] => h2:fresh"
    ]
  };

  JSZipUtils.getBinaryContent(filePath, (err, data) => {
    if (err) {
      throw err; // or handle err
    }
    mammoth.convertToHtml({ arrayBuffer: data }, options).then((result) => {
      // console.log(result);
      // const html = result.value; // The generated HTML
      // const messages = result.messages; // Any messages, such as warnings during conversion
      displayDocument(result);
    }).done();
  });

  if (fileDirectory && fileDirectory.startsWith('file://')) {
    fileDirectory = fileDirectory.substring(('file://').length, fileDirectory.length);
  }

  fixingEmbeddingOfLocalImages($documentContent, fileDirectory);

  function saveExtSettings() {
    const settings = {
      zoomState: currentZoomState
    };
    localStorage.setItem('viewerDocumentSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerDocumentSettings'));
  }
}

// fixing embedding of local images
function fixingEmbeddingOfLocalImages($documentContent, fileDirectory) {
  const hasURLProtocol = function(url) {
    return (
        url.indexOf('http://') === 0 ||
        url.indexOf('https://') === 0 ||
        url.indexOf('file://') === 0 ||
        url.indexOf('data:') === 0
    );
  };

  $documentContent.find('a[href]').each((index, link) => {
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
      $(link).on('click', (e) => {
        e.preventDefault();
        if (path) {
          currentSrc = encodeURIComponent(path);
        }
        sendMessageToHost({ command: 'openLinkExternally', link: currentSrc });
      });
    }
  });
}

function displayDocument(result) {
  // document.getElementById("output").innerHTML = result.value;
  // const messageHtml = result.messages.map((message) => {
  //   return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
  // }).join("");
  // const appendedContent = document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";

  const bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m; // jshint ignore:line
  let bodyContent;
  const content = result.value;
  // const warrningMessage = result.message;

  // const UTF8_BOM = '\ufeff';
  // let docContent = content;
  // if (docContent.indexOf(UTF8_BOM) === 0) {
  //   docContent = docContent.substring(1, docContent.length);
  // }

  try {
    bodyContent = content.match(bodyRegex)[1];
  } catch (e) {
    console.log('Error parsing the body of the HTML document. ' + e);
    bodyContent = content;
  }

  // const sourceURLRegex = /data-sourceurl='([^']*)'/m; // jshint ignore:line
  // const regex = new RegExp(sourceURLRegex);
  // sourceURL = content.match(regex);
  // const url = sourceURL ? sourceURL[1] : undefined;

  // removing all scripts from the document
  const cleanedBodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  $documentContent = $('#documentContent');
  $documentContent.empty().append(cleanedBodyContent);
}

function escapeHtml(value) {
  return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
}
