import { makeKey } from "./makeKey.mjs";
import { getLocale } from "@i18n/__state";
import { _runtime } from "./runtime.mjs";
const localize = (strOrTemplate, ...params) => {
  const locale = getLocale();
  const key = typeof strOrTemplate === "string" ? strOrTemplate : makeKey(strOrTemplate);
  return _runtime(locale, key, params);
};
const _ = localize;
export {
  _,
  localize
};
