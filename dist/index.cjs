"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const __data = require("@i18n/__data");
const __state = require("@i18n/__state");
const guessLocale = require("./guess-locale.cjs");
const interpolate = require("./interpolate.cjs");
const localize = require("./localize.cjs");
const makeKey = require("./makeKey.cjs");
const loadTranslations = require("./load-translations.cjs");
exports.guessLocale = guessLocale.guessLocale;
exports.interpolate = interpolate.interpolate;
exports._ = localize._;
exports.localize = localize.localize;
exports.makeKey = makeKey.makeKey;
exports.loadTranslations = loadTranslations.loadTranslations;
Object.keys(__data).forEach((k) => {
  if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: () => __data[k]
  });
});
Object.keys(__state).forEach((k) => {
  if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: () => __state[k]
  });
});
