/**
 * A shorthand for `localize‵‵`. Translate template string using in-memory maps.
 *
 * `_‵Hi ${name}!‵` converts into a lookup of the `I18nKey` `"Hi $1"`. A literal
 * `$` will be converted to `$$`. Missing translations fall back to the key.
 *
 * If the translation is a Plural object, the first parameter will be used to
 * pick the translation. If no translation is found, the fallback is the value
 * of the `*` key. Number translation values are used to redirect to another
 * translation with that number as a key.
 *
 * If you call this as a function, the call will not be inlined during build.
 * This allows you to dynamically change translations.
 *
 * Nesting is achieved by passing result strings into translations again.
 *
 * ```tsx
 * _`There are ${_`${boys} boys`} and ${_`${girls} girls`}.`
 * ```
 */
export declare const _ = localize;

/**
 * The current locale. You may change this if you don't process multiple locales
 * concurrently in your server code.
 */
export declare let currentLocale: Locale = defaultLocale;

/** The locale JSON file format */
export declare type Data = {
    	/** The locale key, e.g. `en_US` or `nl` */
    	locale: Locale
    	/** Try this locale for missing translations */
    	fallback?: Locale
    	/** The name of the locale in the locale, e.g. "Nederlands" */
    	name?: string
    	/** The translations, either strings with placeholders or plural objects */
    	translations: {
        		[key: Key]: Translation | Plural
        	}
}

/** The default locale as set in `vite.config.ts`. */
export declare let defaultLocale: Locale = 'en';

/**
 * The current locale getter. Change this via `setLocaleGetter`.
 *
 * This is not available in client code.
 */
export declare let getLocale = () => currentLocale;

/**
 * Guess the locale from the Accept-Language header. This can also be used for
 * other strings, but you need to ensure that the string is a valid locale.
 */
export declare const guessLocale = (
	acceptsLanguage: string | null | undefined
): Locale => {
    	if (!acceptsLanguage) return defaultLocale
    	const locales = acceptsLanguage.split(',').map(l => l.split(';')[0])
    	const locale = locales.find(l => l in localeNames)
    	return locale || defaultLocale
};

/**
 * Interpolates a translation with the given parameters. Use this to interpolate
 * at runtime. You will need to provide the translation yourself.
 */
export declare const interpolate = (tr: string | Plural, params: unknown[] = []) => {
    	// Resolve a plural
    	for (let param = 0; typeof tr === 'object'; param++) {
        		let resolved = tr[params[param] as string] ?? tr['*']
        		// A number redirects to another translation with that number as a key
        		if (typeof resolved === 'number') resolved = tr[resolved] as Translation
        		tr = resolved
        	}

    	return typeof tr === 'string'
    		? (tr as string).replace(/\$([\d$])/g, (_, i) =>
    				i === '$' ? '$' : String(params[Number(i) - 1] ?? '')
    			)
    		: ''
};

export declare type Key = string & {T?: 'Key'}

export declare const loadTranslations = (
	translations: Data['translations'],
	locale = currentLocale
) => {
    	if (!store[locale])
    		throw new Error(`loadTranslations: Invalid locale ${locale}`)
    	Object.assign(store[currentLocale].translations, translations)
};

export declare type Locale = string & {T?: 'Locale'}

/** Names of the locales in your application in their respective locale. */
export declare const localeNames: Record<Locale, string> = {
    	en: 'English (compiled-i18n not working)',
};

/** An array of all locales in your application. */
export declare const locales: Locale[] = ['en'];

/**
 * Translate template string using in-memory maps.
 *
 * `localize‵Hi ${name}!‵` converts into a lookup of the `I18nKey` `"Hi $1"`. A
 * literal `$` will be converted to `$$`. Missing translations fall back to the
 * key.
 *
 * If the translation is a Plural object, the first parameter will be used to
 * pick the translation. If no translation is found, the fallback is the value
 * of the `*` key. Number translation values are used to redirect to another
 * translation with that number as a key.
 *
 * If you call this as a function, the call will not be inlined during build.
 * This allows you to dynamically change translations.
 *
 * Nesting is achieved by passing result strings into translations again.
 *
 * ```tsx
 * localize`There are ${localize`${boys} boys`} and ${localize`${girls} girls`}.`
 * ```
 */
export declare const localize = (strOrTemplate, ...params: unknown[]) => {
    	const locale: Locale | undefined = getLocale()
    	const key =
    		typeof strOrTemplate === 'string' ? strOrTemplate : makeKey(strOrTemplate)
    	return _runtime(locale, key, params)
};

export declare const makeKey = (tpl: string[]): Key =>
	tpl
		// We need the function notation so the $$ are not further replaced
		.map((s, i) => `${i}${s.replace(/\$/g, () => '$$')}`)
		.join('$')
		.slice(1);

/**
 * The value of the param used to pick the plural. Use '*' for the fallback
 * value
 */
export declare type Ordinal = string & {T?: 'Ordinal'}

/**
 * When the value is a number, it means to take the value of the tag with that
 * number.
 *
 * Note that inlined Plural translations only work when used with the `plural`
 * function. Runtime translations will work with both `plural` and `_`.
 */
export declare type Plural = {
    	'*': Translation | number | Plural
    	[tag: PluralTag]: Translation | number | Plural
}

declare type PluralTag = number | Ordinal

/**
 * Change the default locale. Use this in dev mode on the client if you can't
 * set the html lang attribute. In production builds this does nothing.
 */
export declare const setDefaultLocale = (locale: Locale) => {
    	defaultLocale = _checkLocale(locale)
};

/**
 * Set the locale getter. It will be called for every translation during SSR. If
 * it doesn't return a locale, the default locale will be used
 *
 * This is not available in client code.
 */
export declare const setLocaleGetter = (fn: () => Locale | undefined) => {
    	getLocale = () => {
        		return (currentLocale = _checkLocale(fn()))
        	}
};

/**
 * A string matching `RegExp('^([^$]|\$[1-9$])*)*$')`, in other words, `$` is
 * used to refer to parameters (max 9) or is escaped as `$$`
 */
export declare type Translation = string & {T?: 'Translation'}

export { }
