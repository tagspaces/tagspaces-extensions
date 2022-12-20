import i18n from 'i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import enUs from './locales/en_US/ns.editorMD.json';

let defaultLanguage = enUs;

function loadLocales(options: any, url: string, payload: any, callback: any) {
  switch (url) {
    case 'bg': {
      import('./locales/bg/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ca': {
      import('./locales/ca/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'cs': {
      import('./locales/cs/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'da_DK': {
      import('./locales/da_DK/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'de_DE': {
      import('./locales/de_DE/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'el': {
      import('./locales/el/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'eo': {
      import('./locales/eo/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'es': {
      import('./locales/es/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'fa': {
      import('./locales/fa/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'fr': {
      import('./locales/fr/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'hu': {
      import('./locales/hu/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'hy': {
      import('./locales/hy/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'id_ID': {
      import('./locales/id_ID/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'it': {
      import('./locales/it/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ja': {
      import('./locales/ja/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ko': {
      import('./locales/ko/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'mt': {
      import('./locales/mt/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'nl_NL': {
      import('./locales/nl_NL/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'pl': {
      import('./locales/pl/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'pt_BR': {
      import('./locales/pt_BR/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'pt_PT': {
      import('./locales/pt_PT/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'ru': {
      import('./locales/ru/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'sk_SK': {
      import('./locales/sk_SK/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'sv': {
      import('./locales/sv/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'tr': {
      import('./locales/tr/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'uk': {
      import('./locales/uk/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'vi': {
      import('./locales/vi/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'zh_CN': {
      import('./locales/zh_CN/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'zh_TW': {
      import('./locales/zh_TW/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'zh_HK': {
      import('./locales/zh_HK/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'nb': {
      import('./locales/nb/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    case 'fr_CA': {
      import('./locales/fr_CA/ns.editorMD.json')
        .then(locale => {
          callback(undefined, { status: '200', data: locale });
          return true;
        })
        .catch(() => {
          console.log('Error loading ' + url + ' locale.');
        });
      break;
    }
    default: {
      callback(undefined, { status: '200', data: defaultLanguage });
      break;
    }
  }
}

const options = {
  fallbackLng: 'enUs',
  // load: 'all', // ['en', 'de'], // we only provide en, de -> no region specific locals like en-US, de-DE
  // ns: ['core'],
  // defaultNS: 'core',
  attributes: ['t', 'i18n'],
  backend: {
    loadPath: '{{lng}}',
    parse: (data: any) => data, // comment to have working i18n switch
    request: loadLocales // comment to have working i18n switch
  }
};

i18n.use(HttpApi).use(LanguageDetector);
if (!i18n.isInitialized) {
  i18n.init(options, (err, t) => {
    if (err) {
      return console.log('something went wrong loading', err);
    }
  });
}

export default i18n;
