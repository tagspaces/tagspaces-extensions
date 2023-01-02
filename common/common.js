/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals marked, sendToParent, $, i18next, jqueryI18next */

const isCordova = document.URL.indexOf('file:///android_asset') === 0; // TODO consider ios case
// isCordovaiOS: /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad/i.test(navigator.userAgent),

const pathToFile = getParameterByName('file');
const isWeb =
  (document.URL.startsWith('http') &&
    !document.URL.startsWith('http://localhost:1212/')) ||
  pathToFile.startsWith('http');
const isWin = navigator.appVersion.includes('Win');
const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

/** Handle theming */
function setTheme(theme) {
  document.documentElement.className = theme;
  // document.documentElement.setAttribute("data-theme", "dark");
}

const rootEl = document.querySelector(':root');
const primaryColor = getParameterByName('primecolor').replace('%23', '#');
const textColor = getParameterByName('textcolor').replace('%23', '#');
const backgroundColor = getParameterByName('bgndcolor').replace('%23', '#');
if (primaryColor) {
  rootEl.style.setProperty('--primary-background-color', primaryColor);
  rootEl.style.setProperty('--default-background-color', backgroundColor);
  rootEl.style.setProperty('--background-color', backgroundColor);
  rootEl.style.setProperty('--primary-text-color', textColor);
  rootEl.style.setProperty('--text-color', textColor);
}

const theme = getParameterByName('theme');
if (theme) {
  document.documentElement.className = theme;
}

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {
    if (isCordova) {
      document.getElementById('printMenuItem').style.display = 'none';
    }
    // } else {
    //   document.getElementById('printMenuItem').addEventListener('click', () => {
    //     alert(document.getElementById('printMenuItem').innerHTML);
    //     setTimeout(() => {
    //       window.print();
    //     }, 300);
    //   });
    // }
  }
});

/**  Helper functions */
function hideLoadingAnimation() {
  document.getElementById('loadingAnimation').style.visibility = 'hidden';
}

// function insertLoadingAnimation() {
//   document.body.innerHTML += `
//   <div id="loadingAnimation" style="text-align: center;">
//     <div class="spinner-border m-5" role="status">
//       <span class="visually-hidden">Loading...</span>
//     </div>
//   </div>
//   `;
// }

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

function loadExtSettings(key) {
  return JSON.parse(localStorage.getItem(key));
}

function saveExtSettings(key, value) {
  const settings = localStorage.setItem(key, JSON.stringify(value));
  // console.debug(settings);
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

function toDataURL(src, callback, format) {
  let imageFormat = 'image/jpeg';
  if (format && format.toLowerCase() === 'png') {
    imageFormat = 'image/png';
  } else if (format && format.toLowerCase() === 'webp') {
    imageFormat = 'image/webp';
  }
  const image = new Image();
  image.crossOrigin = 'Anonymous';
  image.onload = function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    context.drawImage(this, 0, 0);
    const dataURL = canvas.toDataURL(imageFormat, 0.9);
    callback(dataURL);
  };
  image.src = src;
}

function extractFileName(filePath, dirSeparator = '/') {
  if (filePath.endsWith(dirSeparator)) {
    return '';
  }
  return filePath
    ? filePath.substring(
        filePath.lastIndexOf(dirSeparator) + 1,
        filePath.length
      )
    : filePath;
}

function initI18N(locale, filename, localePath) {
  lPath = localePath || '../common/locales';
  getFileContentPromise(lPath + '/en_US/' + filename, 'text') // loading fallback lng
    .then(enLocale => {
      const i18noptions = {
        lng: locale,
        // debug: true,
        resources: {},
        fallbackLng: 'en_US'
      };
      i18noptions.resources.en_US = {};
      i18noptions.resources.en_US.translation = JSON.parse(enLocale);
      getFileContentPromise(lPath + '/' + locale + '/' + filename, 'text')
        .then(content => {
          i18noptions.resources[locale] = {};
          i18noptions.resources[locale].translation = JSON.parse(content);
          i18next.init(i18noptions, () => {
            // console.log(i18next.t('startSearch'));
            const el4i18n = document.querySelectorAll('[data-i18n]');
            el4i18n.forEach(el => {
              el.textContent = i18next.t(el.dataset.i18n);
            });
            const elTit4i18n = document.querySelectorAll('[data-i18ntitle]');
            elTit4i18n.forEach(el => {
              el.setAttribute('title', i18next.t(el.dataset.i18ntitle));
            });
          });
          return true;
        })
        .catch(error => {
          console.log('Error getting specific i18n locale: ' + error);
          i18next.init(i18noptions, () => {
            // console.log('Fallback ' + i18next.t('startSearch'));
            const el4i18n = document.querySelectorAll('[data-i18n]');
            el4i18n.forEach(el => {
              el.textContent = i18next.t(el.dataset.i18n);
            });
            const elTit4i18n = document.querySelectorAll('[data-i18ntitle]');
            elTit4i18n.forEach(el => {
              el.setAttribute('title', i18next.t(el.dataset.i18ntitle));
            });
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

function handleLinks(domElement) {
  const allLinks = domElement.querySelectorAll('a');
  allLinks.forEach(link => {
    let currentSrc = link.href;
    let path;
    if (currentSrc.startsWith('#')) {
      // Leave the default link behaviour by internal links
    } else {
      // if (!hasURLProtocol(currentSrc)) {
      //   path =
      //     (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      //   link.href = path;
      // }
      isExternal = isExternalLink(currentSrc);
      link.innerText += ' ⧉';
      link.title = currentSrc;
      link.addEventListener('click', e => {
        e.preventDefault();
        // if (path) {
        //   currentSrc = encodeURIComponent(path);
        // }
        sendMessageToHost({
          command: 'openLinkExternally',
          link: currentSrc
        });
      });
    }
  });
}

function isExternalLink(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

function hasURLProtocol(url) {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file://') ||
    url.startsWith('data:') ||
    url.startsWith('ts://?ts') ||
    url.startsWith('ts:?ts')
  );
}

function openPrintDialog() {
  setTimeout(() => {
    window.print();
  }, 300);
}

/* BEGIN: Find in content functionality */

let queryArray = [];
let markInstance;

function markInText() {
  showFindToolbar();
  if (markInstance && queryArray.length > 0) {
    markInstance.unmark({
      done: function() {
        markInstance.mark(queryArray, {});
      }
    });
  }
}

function startSearch() {
  const queryInput = document.getElementById('queryInput').value;
  queryArray = queryInput.split(' ');
  markInText();
}

function initFindToolbar() {
  document.getElementById('findToolbarPlaceholder').innerHTML = `
  <div id="findToolbar" style="display: none; margin: 10px; width: auto;">
    <div class="input-group">
      <input
        type="search"
        class="form-control"
        placeholder="Find in document..."
        id="queryInput"
        aria-label="Search"
        aria-describedby="search-addon"
      />
      <button
        id="startSearch"
        type="button"
        class="btn btn-primary"
      >
      <svg width="16" height="16" class="bi">
        <path
          d="M4.5 1A1.5 1.5 0 0 0 3 2.5V3h4v-.5A1.5 1.5 0 0 0 5.5 1h-1zM7 4v1h2V4h4v.882a.5.5 0 0 0 .276.447l.895.447A1.5 1.5 0 0 1 15 7.118V13H9v-1.5a.5.5 0 0 1 .146-.354l.854-.853V9.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v.793l.854.853A.5.5 0 0 1 7 11.5V13H1V7.118a1.5 1.5 0 0 1 .83-1.342l.894-.447A.5.5 0 0 0 3 4.882V4h4zM1 14v.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5V14H1zm8 0v.5a1.5 1.5 0 0 0 1.5 1.5h3a1.5 1.5 0 0 0 1.5-1.5V14H9zm4-11H9v-.5A1.5 1.5 0 0 1 10.5 1h1A1.5 1.5 0 0 1 13 2.5V3z"
        />
      </svg>
      </button>
    </div>
  </div>
  `;

  document.getElementById('queryInput').addEventListener('keyup', evt => {
    // if (evt.key === 'Enter') {
    startSearch();
    // }
  });

  document.addEventListener('keyup', evt => {
    if (evt.key === 'Escape') {
      hideFindToolbar();
    }
  });

  document.getElementById('startSearch').addEventListener('click', startSearch);

  document
    .getElementById('toggleFindMenuItem')
    .addEventListener('click', toggleFindToolbar);

  const searchQuery = getParameterByName('query'); // 'help:file';
  if (searchQuery) {
    queryArray = searchQuery.split(':');
  }
  const documentContent = document.getElementById('documentContent');
  markInstance = new Mark(documentContent);
  if (queryArray && queryArray.length > 0) {
    document.getElementById('queryInput').value = queryArray.join(' ');
    markInText();
  }
}

function hideFindToolbar() {
  document.getElementById('findToolbar').style.display = 'none';
  document.getElementById('queryInput').value = '';
  markInstance.unmark();
}

function showFindToolbar() {
  document.getElementById('findToolbar').style.display = 'block';
  document.getElementById('queryInput').focus();
}

function toggleFindToolbar() {
  const isFindToolbarVisible =
    document.getElementById('findToolbar').style.display === 'block';
  isFindToolbarVisible ? hideFindToolbar() : showFindToolbar();
}

/* END: Find in content functionality */

function insertAboutDialog(helpURL) {
  document.body.innerHTML += `
  <div
    class="modal fade"
    id="aboutModal"
    tabindex="-1"
    aria-labelledby="aboutModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="aboutModalLabel">
            <span data-i18n="aboutTitle" />
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          This extension is license under the permissive MIT license. The source code can be found in this git repository
          <a href="https://github.com/tagspaces/tagspaces-extensions">github.com/tagspaces/tagspaces-extensions</a
          >.
        </div>
        <div class="modal-footer" style="justify-content: space-between;">
          <button
            type="button"
            class="btn btn-primary"
            id="helpButton"
          >
            <span data-i18n="documentation" />
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            >
            <span data-i18n="ok" />
          </button>
        </div>
      </div>
    </div>  
  `;
  const aboutModal = new bootstrap.Modal('#aboutModal', {});

  handleLinks(document.getElementById('aboutModal'));

  getFileContentPromise('../package.json', 'text')
    .then(content => {
      const extVersion = JSON.parse(content).version;
      document.getElementById('aboutModalLabel').title =
        'Extension package version: ' + extVersion;
    })
    .catch(e => {
      console.log('Error getting extension version');
    });

  document.getElementById('helpButton').addEventListener('click', e => {
    // e.preventDefault();
    const msg = { command: 'openLinkExternally', link: helpURL };
    sendMessageToHost(msg);
  });
}
