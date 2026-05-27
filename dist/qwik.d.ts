import { RenderOptions } from '@builder.io/qwik';

/**
 * This sets the base path for assets for a Qwik application. Pass it to the
 * `base` property of the render options.
 *
 * If running in development mode, the base path is simply /build. Otherwise,
 * it's /build/{locale}. We also account for the base path given to vite.
 */
export declare const extractBase: ({ serverData }: RenderOptions) => string;

/**
 * Configure compiled-i18n to use the locale from Qwik during SSR.
 *
 * Call this in your entry.ssr file.
 */
export declare const setSsrLocaleGetter: () => void;

export { }
