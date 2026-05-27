"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const makeKey = require("./makeKey.cjs");
const __state = require("@i18n/__state");
const runtime = require("./runtime.cjs");
const localize = (strOrTemplate, ...params) => {
  const locale = __state.getLocale();
  const key = typeof strOrTemplate === "string" ? strOrTemplate : makeKey.makeKey(strOrTemplate);
  return runtime._runtime(locale, key, params);
};
const _ = localize;
exports._ = _;
exports.localize = localize;
