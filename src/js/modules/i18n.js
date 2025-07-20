import _ from 'lodash';
import Persistence from '@/modules/Persistence';
import Actions from '@/actions';

let currentLanguage = null;
const translations = [
	{
		code: 'en',
		name: 'English',
		phrases: null,
	},
	{
		code: 'sr',
		name: 'Serbian',
		phrases: () => import('../languages/sr.js'),
	},
];

function getTranslationByCode(language) {
	return translations.find(t => t.code === language);
}
function isLanguageSupported(language) {
	return !!getTranslationByCode(language.substr(0, 2).toLowerCase());
}

export function getInitialLanguage() {
	const savedLanguage = Persistence.get('language');
	if (savedLanguage !== null && isLanguageSupported(savedLanguage)) {
		return savedLanguage.toLowerCase();
	}

	// if (window.navigator.languages !== undefined) {
	// 	const result = _.find(window.navigator.languages, language => isLanguageSupported(language));
	// 	if (result !== undefined) {
	// 		return result.substr(0, 2).toLowerCase();
	// 	}
	// }
	return 'en';
}

function nullTranslation(v) {
	return v;
}

const untranslatedPhrases = {};

function getTranslateFn(phrases) {
	if (!phrases) {
		return nullTranslation;
	}

	return function (key) {
		if (!(key in phrases)) {
			if (window.LogMissingTranslations && _.size(phrases) > 1) {
				untranslatedPhrases[key] = '';
				let str = '{\n';
				for (const key in untranslatedPhrases) {
					str += '\t[`' + key + '`]: ``,\n';
				}
				str += '}\n';
				/* eslint-disable no-console */
				console.log(str);
			}
			return key;
		}
		return phrases[key];
	};
}

export function translateFn(language) {
	currentLanguage = language;

	let useLanguage = language;
	const translation = getTranslationByCode(language);
	if (translation.phrases && typeof translation.phrases === 'function') {
		if (!translation.resolving) {
			translation.resolving = true;
			translation.phrases().then(t => {
				translation.phrases = t.default;
				if (currentLanguage === language) {
					Actions.setLanguage(language);
				}
			});
		}
		useLanguage = 'en';
	}
	return getTranslateFn(getTranslationByCode(useLanguage).phrases);
}

export const getSupportedLanguages = () => translations;
