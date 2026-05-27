import { localeNames } from "@i18n/__data";
import { defaultLocale } from "@i18n/__state";
const guessLocale = (acceptsLanguage) => {
  if (!acceptsLanguage) return defaultLocale;
  const locales = acceptsLanguage.split(",").map((l) => l.split(";")[0]);
  const locale = locales.find((l) => l in localeNames);
  return locale || defaultLocale;
};
export {
  guessLocale
};
