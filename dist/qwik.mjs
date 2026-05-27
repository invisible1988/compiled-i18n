import { getLocale } from "@builder.io/qwik";
import { setLocaleGetter, defaultLocale } from "@i18n/__state";
const extractBase = ({ serverData }) => {
  const basePath = `${import.meta.env.BASE_URL}build${import.meta.env.DEV ? "" : `/${serverData.locale}`}`;
  return basePath;
};
const setSsrLocaleGetter = () => {
  setLocaleGetter(() => getLocale(defaultLocale));
};
export {
  extractBase,
  setSsrLocaleGetter
};
