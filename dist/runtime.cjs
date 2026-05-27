"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const interpolate = require("./interpolate.cjs");
const store = require("@i18n/__locales");
const _runtime = (locale, key, params) => {
  let s, tr;
  do {
    s = store[locale];
    tr = s.translations[key];
  } while (!tr && (locale = s.fallback));
  if (!tr) tr = key;
  return interpolate.interpolate(tr, params);
};
exports._runtime = _runtime;
