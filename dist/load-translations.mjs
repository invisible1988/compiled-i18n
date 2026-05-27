import store from "@i18n/__locales";
import { currentLocale } from "@i18n/__state";
const loadTranslations = (translations, locale = currentLocale) => {
  if (!store[locale])
    throw new Error(`loadTranslations: Invalid locale ${locale}`);
  Object.assign(store[currentLocale].translations, translations);
};
export {
  loadTranslations
};
