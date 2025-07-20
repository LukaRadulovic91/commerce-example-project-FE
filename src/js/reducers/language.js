import dayjs from 'dayjs';
import { translateFn, getInitialLanguage } from '@/modules/i18n';
import Persistence from '@/modules/Persistence';

const initialLanguage = getInitialLanguage();
const initialFn = translateFn(initialLanguage);

const locales = {
	en: () => import('dayjs/locale/en'),
};

export function i18n(state = initialFn, action) {
	switch (action.type) {
		case 'SET_LANGUAGE':
			Persistence.set('language', action.language);
			locales[action.language]().then(() => {
				dayjs.locale(action.language);
			});
			return translateFn(action.language);
		default:
			return state;
	}
}

export function language(state = initialLanguage, action) {
	switch (action.type) {
		case 'SET_LANGUAGE':
			return action.language;
		default:
			return state;
	}
}