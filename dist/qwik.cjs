"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const qwik = require("@builder.io/qwik");
const __state = require("@i18n/__state");
const extractBase = ({ serverData }) => {
  const basePath = `${(void 0).BASE_URL}build${(void 0).DEV ? "" : `/${serverData.locale}`}`;
  return basePath;
};
const setSsrLocaleGetter = () => {
  __state.setLocaleGetter(() => qwik.getLocale(__state.defaultLocale));
};
exports.extractBase = extractBase;
exports.setSsrLocaleGetter = setSsrLocaleGetter;
