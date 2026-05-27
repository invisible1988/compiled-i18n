"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const store = require("@i18n/__locales");
const __state = require("@i18n/__state");
const loadTranslations = (translations, locale = __state.currentLocale) => {
  if (!store[locale])
    throw new Error(`loadTranslations: Invalid locale ${locale}`);
  Object.assign(store[__state.currentLocale].translations, translations);
};
exports.loadTranslations = loadTranslations;
