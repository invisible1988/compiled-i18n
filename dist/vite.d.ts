import { Plugin } from 'vite';

export declare function i18nPlugin(options?: Options): Plugin[];

declare type Options = {
    /** The locales you want to support */
    locales?: string[];
    /** The directory where the locale files are stored, defaults to /i18n */
    localesDir?: string;
    /** The default locale, defaults to the first locale */
    defaultLocale?: string;
    /** Extra Babel plugins to use when transforming the code */
    babelPlugins?: any[];
    /**
     * The subdirectory of browser assets in the output. Locale post-processing
     * and locale subdirectory creation will only happen under this subdirectory.
     * Do not include a leading slash.
     *
     * If the qwikVite plugin is detected, this defaults to `build/`.
     */
    assetsDir?: string;
    /** Automatically add missing keys to the locale files. Defaults to true */
    addMissing?: boolean;
    /** Automatically remove unused keys from the locale files. Defaults to false. */
    removeUnusedKeys?: boolean;
    /** Use tabs on new JSON files */
    tabs?: boolean;
    /**
     * Glob patterns (relative to the Vite root) of extra source files to scan for
     * `_` / `localize` tagged-template usage when deciding which keys are
     * missing/unused.
     *
     * The bundler `transform` only sees `.cjs/js/mjs/ts/jsx/tsx`, so keys used
     * only in files of other types — e.g. Astro/Vue/Svelte components, where
     * usage often lives in template expressions — would otherwise be reported as
     * unused (and removed by `removeUnusedKeys`). This opt-in static scan reads
     * those files directly so the missing/unused report is accurate regardless of
     * which build pass ran.
     *
     * The scan is a loose textual match (see ./scan-usage): a match in a comment
     * or string counts as "used" — the safe direction. Example: `usageGlobs:
     * ['src/**\/*.astro']`.
     */
    usageGlobs?: string[];
};

export { }
