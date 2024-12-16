import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import en from '../assets/locales/en.json';
import bg from '../assets/locales/bg.json';

export const resources = {
  en: { translation: en },
  bg: { translation: bg },
};

export const defaultNS = 'translation';

//@ts-ignore
const lng = window.locale;

i18n
  // load translation using http -> see /assets/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/assets/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  //.use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    returnNull: false,
    fallbackLng: 'en',
    debug: true,
    supportedLngs: ['en', 'bg'],
    ns: ['translation'],
    defaultNS,
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
    ...(lng && { lng: lng }),
    //request: loadLocales,
  });

export default i18n;

/*async function loadLocales(_: any, url: string, payload: any, callback: any) {
  const loadLocale = async (path: string) => {
    try {
      return await import(
        /!* @vite-ignore *!/ '/locales/' + path + '/core.json'
        );
    } catch (error) {
      console.error(
        `Error loading locale file at '/locales/${path}/core.json':`,
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
      callback(null, { status: '200', data: loadLocale('en') });
    }
  } catch (error) {
    console.error('Unexpected error in loadLocales:', error);
    callback(null, { status: '500', data:  loadLocale('en') });
  }
}*/
