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

function setTheme(theme) {
  document.documentElement.className = theme;
  // document.documentElement.setAttribute("data-theme", "dark");
}

const theme = getParameterByName('theme');
if (theme) {
  document.documentElement.className = theme;
}

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
  getFileContentPromise('../common/locales/en_US/' + filename, 'text') // loading fallback lng
    .then(enLocale => {
      const i18noptions = {
        lng: locale,
        // debug: true,
        resources: {},
        fallbackLng: 'en_US'
      };
      i18noptions.resources.en_US = {};
      i18noptions.resources.en_US.translation = JSON.parse(enLocale);
      getFileContentPromise(
        '../common/locales/' + locale + '/' + filename,
        'text'
      )
        .then(content => {
          i18noptions.resources[locale] = {};
          i18noptions.resources[locale].translation = JSON.parse(content);
          i18next.init(i18noptions, () => {
            // console.log(i18next.t('startSearch'));
            const el4i18n = document.querySelectorAll('[data-i18n]');
            el4i18n.forEach(el => {
              el.textContent = i18next.t(el.dataset.i18n);
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

function insertAboutDialog(url) {
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
          Please visit the dedicated
          <a id="docsLink" href="${url}">page</a
          >
          for this extension in our documentation.
        </div>
        <div class="modal-footer">
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
  document.getElementById('docsLink').addEventListener('click', e => {
    e.preventDefault();
    const msg = { command: 'openLinkExternally', link: e.target.href };
    sendMessageToHost(msg);
  });
}
