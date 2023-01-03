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

function fixingEmbeddingOfLocalImages(domElement, fileDirectory) {
  const allImages = domElement.querySelectorAll('img');
  allImages.forEach(image => {
    const currentSrc = image.src;
    if (!hasURLProtocol(currentSrc)) {
      const path = (isWeb ? '' : 'file://') + fileDirectory + '/' + currentSrc;
      image.src = path;
    }
  });
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
        <svg width="24" height="24" class="bi">
          <path
            d="M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59zM9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z"
          ></path>
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
  markInstance && markInstance.unmark();
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

function insertToggleFindMenuItem() {
  document.getElementById('toggleFindMenuItemPlaceholder').innerHTML = `
    <a id="toggleFindMenuItem" class="dropdown-item" href="#">
      <svg width="24" height="24" class="bi">
        <path
          d="M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59zM9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z"
        ></path>
      </svg>
      <span data-i18n="findInDocument" />
    </a>
  `;
}

function insertPrintMenuItem() {
  document.getElementById('printMenuItemPlaceholder').innerHTML = `
    <a id="printMenuItem" class="dropdown-item" href="#">
      <svg width="24" height="24" class="bi">
        <path
          d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"
        ></path>
      </svg>
      <span data-i18n="print" />
    </a>
  `;
  document.getElementById('printMenuItem').addEventListener('click', () => {
    setTimeout(() => {
      window.print();
    }, 300);
  });
}

function insertAboutDialog(helpURL) {
  document.getElementById('aboutMenuItemPlaceholder').innerHTML = `
    <a
      class="dropdown-item"
      href="#"
      data-bs-toggle="modal"
      data-bs-target="#aboutModal"
    >
      <svg width="24" height="24" class="bi">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
        ></path>
      </svg>
      <span data-i18n="about" />
    </a>
  `;

  document.getElementById('aboutDialogPlaceholder').innerHTML = `
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
