import { interpolate } from "./interpolate.mjs";
import store from "@i18n/__locales";
const _runtime = (locale, key, params) => {
  let s, tr;
  do {
    s = store[locale];
    tr = s.translations[key];
  } while (!tr && (locale = s.fallback));
  if (!tr) tr = key;
  return interpolate(tr, params);
};
export {
  _runtime
};
