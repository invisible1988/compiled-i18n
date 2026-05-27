"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const __data = require("@i18n/__data");
const __state = require("@i18n/__state");
const guessLocale = (acceptsLanguage) => {
  if (!acceptsLanguage) return __state.defaultLocale;
  const locales = acceptsLanguage.split(",").map((l) => l.split(";")[0]);
  const locale = locales.find((l) => l in __data.localeNames);
  return locale || __state.defaultLocale;
};
exports.guessLocale = guessLocale;
