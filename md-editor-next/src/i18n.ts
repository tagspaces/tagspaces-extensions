import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';
//import Backend from 'i18next-http-backend';

import en from './locales/en_US/ns.extension.json';
import bg from './locales/bg/ns.extension.json';
import ca from './locales/ca/ns.extension.json';
import da_DK from './locales/da_DK/ns.extension.json';
import de_DE from './locales/de_DE/ns.extension.json';
import el from './locales/el/ns.extension.json';
import eo from './locales/eo/ns.extension.json';
import es from './locales/es/ns.extension.json';
import es_CL from './locales/es_CL/ns.extension.json';
import fa from './locales/fa/ns.extension.json';
import fr from './locales/fr/ns.extension.json';
import fr_CA from './locales/fr_CA/ns.extension.json';
import fr_CH from './locales/fr_CH/ns.extension.json';
import he from './locales/he/ns.extension.json';
import hu from './locales/hu/ns.extension.json';
import hy from './locales/hy/ns.extension.json';
import id_ID from './locales/id_ID/ns.extension.json';
import it from './locales/it/ns.extension.json';
import ja from './locales/ja/ns.extension.json';
import ko from './locales/ko/ns.extension.json';
import mt from './locales/mt/ns.extension.json';
import nb from './locales/nb/ns.extension.json';
import nl_NL from './locales/nl_NL/ns.extension.json';
import pl from './locales/pl/ns.extension.json';
import pt_BR from './locales/pt_BR/ns.extension.json';
import pt_PT from './locales/pt_PT/ns.extension.json';
import ru from './locales/ru/ns.extension.json';
import sk_SK from './locales/sk_SK/ns.extension.json';
import sv from './locales/sv/ns.extension.json';
import tr from './locales/tr/ns.extension.json';
import uk from './locales/uk/ns.extension.json';
import vi from './locales/vi/ns.extension.json';
import zh_CN from './locales/zh_CN/ns.extension.json';
import zh_HK from './locales/zh_HK/ns.extension.json';
import zh_TW from './locales/zh_TW/ns.extension.json';

export const resources = {
  en: { translation: en },
  bg: { translation: bg },
  ca: { translation: ca },
  da_DK: { translation: da_DK },
  de: { translation: de_DE },
  el: { translation: el },
  eo: { translation: eo },
  es: { translation: es },
  es_CL: { translation: es_CL },
  fa: { translation: fa },
  fr: { translation: fr },
  fr_CA: { translation: fr_CA },
  fr_CH: { translation: fr_CH },
  he: { translation: he },
  hu: { translation: hu },
  hy: { translation: hy },
  id_ID: { translation: id_ID },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  mt: { translation: mt },
  nb: { translation: nb },
  nl_NL: { translation: nl_NL },
  pl: { translation: pl },
  pt_BR: { translation: pt_BR },
  pt_PT: { translation: pt_PT },
  ru: { translation: ru },
  sk_SK: { translation: sk_SK },
  sv: { translation: sv },
  tr: { translation: tr },
  uk: { translation: uk },
  vi: { translation: vi },
  zh_CN: { translation: zh_CN },
  zh_HK: { translation: zh_HK },
  zh_TW: { translation: zh_TW }
};

export const supportedLngs = [
  'en',
  'bg',
  'ca',
  'da_DK',
  'de',
  'el',
  'eo',
  'es',
  'es_CL',
  'fa',
  'fr',
  'fr_CA',
  'fr_CH',
  'he',
  'hu',
  'hy',
  'id_ID',
  'it',
  'ja',
  'ko',
  'mt',
  'nb',
  'nl_NL',
  'pl',
  'pt_BR',
  'pt_PT',
  'ru',
  'sk_SK',
  'sv',
  'tr',
  'uk',
  'vi',
  'zh_CN',
  'zh_HK',
  'zh_TW'
];

export const defaultNS = 'translation';

//@ts-ignore
const lng = window.locale;

i18n
  // load translation using http -> see /assets/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/assets/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  // want your translations to be loaded from a professional CDN? => https://github.com/locize/react-tutorial#step-2---use-the-locize-cdn
  //.use(Backend)
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
    supportedLngs,
    ns: ['translation'],
    defaultNS,
    // load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    resources,
    ...(lng && { lng: lng })
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
