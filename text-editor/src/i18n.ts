import i18n from 'i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import enUs from './locales/en/ns.extension.json';

let defaultLanguage = enUs;

interface LoadLocalesOptions {
  url: string;
  payload?: Record<string, any>;
  callback: (error: any, data: { status: string; data: any }) => void;
}

async function loadLocales(
  _: LoadLocalesOptions,
  url: string,
  payload: any,
  callback: any
) {
  const loadLocale = async (path: string) => {
    try {
      return await import(
        /* @vite-ignore */ './locales/' + path + '/ns.extension.json'
      );
    } catch (error) {
      console.error(
        `Error loading locale file at './locales/${path}/ns.extension.json':`,
        error
      );
      return null;
    }
  };

  try {
    // Try to load the full locale (e.g., bg-BG)
    let locale = await loadLocale(url);
    if (!locale) {
      // If full locale fails, fallback to the primary language (e.g., bg)
      const primaryLocale = url.split('-')[0];
      locale = await loadLocale(primaryLocale);
    }

    if (locale) {
      callback(null, { status: '200', data: locale });
    } else {
      console.warn(
        `Failed to load both specific (${url}) and fallback (${
          url.split('-')[0]
        }) locales.`
      );
      callback(null, { status: '200', data: defaultLanguage });
    }
  } catch (error) {
    console.error('Unexpected error in loadLocales:', error);
    callback(null, { status: '500', data: defaultLanguage });
  }
}

const options = {
  fallbackLng: 'en',
  // load: 'all', // ['en', 'de'], // we only provide en, de -> no region specific locals like en-US, de-DE
  // ns: ['core'],
  // defaultNS: 'core',
  attributes: ['t', 'i18n'],
  backend: {
    loadPath: '{{lng}}',
    parse: (data: any) => data, // comment to have working i18n switch
    request: loadLocales, // comment to have working i18n switch
  },
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
