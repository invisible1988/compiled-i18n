export * from "@i18n/__data";
export * from "@i18n/__state";
import { guessLocale } from "./guess-locale.mjs";
import { interpolate } from "./interpolate.mjs";
import { _, localize } from "./localize.mjs";
import { makeKey } from "./makeKey.mjs";
import { loadTranslations } from "./load-translations.mjs";
export {
  _,
  guessLocale,
  interpolate,
  loadTranslations,
  localize,
  makeKey
};
