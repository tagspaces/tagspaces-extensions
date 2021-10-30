/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals marked, sendToParent, $, i18next, jqueryI18next */

// window.addEventListener('beforeunload', function(e) {
//   console.log('Unloading: ' + JSON.stringify(e));
//   // Cancel the event
//   // e.preventDefault();
//   // Chrome requires returnValue to be set
//   e.returnValue = 'Do you really want to leave this page?';
// });

const isCordova = document.URL.indexOf('file:///android_asset') === 0; // TODO consider ios case
// isCordovaiOS: /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad/i.test(navigator.userAgent),

const pathToFile = getParameterByName('file');
const isWeb =
  (document.URL.startsWith('http') &&
    !document.URL.startsWith('http://localhost:1212/')) ||
  pathToFile.startsWith('http');
const isWin = navigator.appVersion.includes('Win');
const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

function getParameterByName(paramName) {
  const name = paramName.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  let param =
    results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  if (param.includes('#')) {
    param = param.split('#').join('%23');
  }
  return param;
}

function getFileContentPromise(fullPath, type) {
  return new Promise((resolve, reject) => {
    const fileURL = fullPath;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileURL, true);
    xhr.responseType = type || 'arraybuffer';
    xhr.onerror = reject;

    xhr.onload = () => {
      const response = xhr.response || xhr.responseText;
      if (response) {
        resolve(response);
      } else {
        reject('getFileContentPromise error');
      }
    };
    xhr.send();
  });
}

function initI18N(locale, filename) {
  getFileContentPromise('./locales/en_US/' + filename, 'text') // loading fallback lng
    .then(enLocale => {
      const i18noptions = {
        lng: locale,
        // debug: true,
        resources: {},
        fallbackLng: 'en_US'
      };
      i18noptions.resources.en_US = {};
      i18noptions.resources.en_US.translation = JSON.parse(enLocale);
      getFileContentPromise('./locales/' + locale + '/' + filename, 'text')
        .then(content => {
          i18noptions.resources[locale] = {};
          i18noptions.resources[locale].translation = JSON.parse(content);
          i18next.init(i18noptions, () => {
            jqueryI18next.init(i18next, $); // console.log(i18next.t('startSearch'));
            $('body').localize();
          });
          return true;
        })
        .catch(error => {
          console.log('Error getting specific i18n locale: ' + error);
          i18next.init(i18noptions, () => {
            jqueryI18next.init(i18next, $); // console.log(i18next.t('startSearch'));
            $('body').localize();
          });
        });
      return true;
    })
    .catch(error => console.log('Error getting default i18n locale: ' + error));
}

function getBase64Image(imgURL) {
  const canvas = document.createElement('canvas');
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgURL;
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

function sendMessageToHost(message) {
  if (typeof sendToParent === 'function') {
    sendToParent(message);
  } else {
    window.parent.postMessage(JSON.stringify(message), '*');
  }
}

$(() => {
  // Disable drag events in extensions
  $(document).on('drop dragend dragenter dragover', event => {
    event.preventDefault();
  });

  // Init about box functionality
  const modalBody = $('#aboutExtensionModal .modal-body');
  $('#aboutExtensionModal').on('show.bs.modal', () => {
    $.ajax({
      url: 'README.md',
      type: 'GET'
    })
      .done(mdData => {
        // console.log("DATA: " + mdData);
        if (marked) {
          modalBody.html(marked(mdData, { sanitize: true }));
          handleLinks(modalBody);
        } else {
          console.log('markdown to html transformer not found');
        }
      })
      .fail(data => {
        handleLinks(modalBody);
        console.warn('Loading file failed ' + data);
      });
  });

  $('#aboutButton').off();
  $('#aboutButton').on('click', () => {
    $('#aboutExtensionModal').modal({ show: true });
  });

  $('#printButton').off();
  $('#printButton').on('click', () => {
    window.print();
    return true;
  });

  if (isCordova) {
    $('#printButton').hide();
  }

  initSearch();
});

function handleLinks($element) {
  $element.find('a[href]').each((index, link) => {
    const currentSrc = $(link).attr('href');
    $(link).off();
    $(link).on('click', e => {
      e.preventDefault();
      const msg = { command: 'openLinkExternally', link: currentSrc };
      sendMessageToHost(msg);
    });
  });
}

function showSearchPanel() {
  // $('#searchToolbar').slideDown(500);
  $('#searchToolbar').show();
  $('#searchBox').val('');
  $('#searchBox').focus();
}

function cancelSearch() {
  // $('#searchToolbar').slideUp(500);
  $(document.body).unhighlight();
  $('#searchToolbar').hide();
  $('#searchBox').hide();
}

function initSearch() {
  $('#findInFile').off();
  $('#findInFile').on('click', () => {
    showSearchPanel();
  });

  $('#searchExtButton').off();
  $('#searchExtButton').on('click', () => {
    doSearch();
  });

  $('#clearSearchExtButton').off();
  $('#clearSearchExtButton').on('click', () => {
    cancelSearch();
  });

  $('#searchBox').keyup(e => {
    if (e.keyCode === 13) {
      // Start the search on ENTER
      doSearch();
    }
  });

  $(window).keyup(e => {
    if (e.keyCode === 27) {
      // Hide search on ESC
      cancelSearch();
    }
  });

  window.addEventListener('keyup', evt => {
    let handled = false;
    const cmd =
      (evt.ctrlKey ? 1 : 0) |
      (evt.altKey ? 2 : 0) |
      (evt.shiftKey ? 4 : 0) |
      (evt.metaKey ? 8 : 0);
    /*
     First, handle the key bindings that are independent whether an input
     control is selected or not.
     */
    if (cmd === 1 || cmd === 8 || cmd === 5 || cmd === 12) {
      // either CTRL or META key with optional SHIFT.
      switch (evt.keyCode) {
        case 70: // f
          // open custom search/find text
          handled = true;
          break;
        case 71: // g
          // find next
          handled = true;
          break;
        case 61: // FF/Mac "="
        case 107: // FF "+" and "="
        case 187: // Chrome "+"
        case 171: // FF with German keyboard
          // zoom in
          handled = true;
          break;
        case 173: // FF/Mac "-"
        case 109: // FF "-"
        case 189: // Chrome "-"
          // zoom out
          handled = true;
          break;
        default:
          handled = false;
      }
    }

    // CTRL or META without shift
    if (cmd === 1 || cmd === 8) {
      switch (evt.keyCode) {
        case 70: // f
          showSearchPanel(); // open custom search/find text
          handled = true;
          break;
        default:
          handled = false;
      }
    }

    // CTRL+ALT or Option+Command
    if (cmd === 3 || cmd === 10) {
      switch (evt.keyCode) {
        case 80: // p
          // presentaion mode
          handled = true;
          break;
        case 71: // g
          // focus page number dialoge
          handled = true;
          break;
        default:
          handled = false;
      }
    }
    if (handled) {
      evt.preventDefault();
    }
  });
}

function doSearch() {
  $(document.body).unhighlight();
  $('#searchBox').attr('placeholder', 'Search');
  const givenString = document.getElementById('searchBox').value;

  const selector = $(document.body);
  const caseSensitiveString = $(document.body).highlight(givenString, {
    wordsOnly: false
  });
  let found;

  if (window.find) {
    // Firefox, Google Chrome, Safari
    found = window.find(givenString);
    $(document.body).highlight(givenString, { wordsOnly: false });

    const searchTermRegEx = new RegExp(found, 'ig');
    const matches = $(selector)
      .text()
      .match(searchTermRegEx);
    if (matches) {
      if ($('.highlight:first').length) {
        // if match found, scroll to where the first one appears
        // $(window).animate({scrollTo:($("*:contains('"+ givenString +"')").offset().top)},"fast");
        // $(selector).animate({scrollTop: $('#htmlContent .highlight::selection').offset().top}, "fast");
        // window.find(givenString);
        // $(window).animate({scrollTop: window.find(givenString)}, "fast");
      }
    }
    if (!found || (!found && !caseSensitiveString) || !caseSensitiveString) {
      const topOfContent = $(selector).animate(
        { scrollTop: $(document.body).offset().top },
        'fast'
      );
      $('#searchBox').val('');
      $('#searchBox').attr('placeholder', 'Search text not found. Try again.');
      return topOfContent;
    }
  }
}
