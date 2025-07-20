import config from '@/config';

const prefix = config.namespace + '-';

export default {
	get: k => localStorage.getItem(prefix + k),
	set: (k, v) => {
		try {
			localStorage.setItem(prefix + k, v);
		} catch (e) {
			// do nothing
		}
	},
	remove: k => localStorage.removeItem(prefix + k),
};

export const loadState = () => {
    try {
      const serialState = localStorage.getItem(prefix + 'appState');
      if (serialState === null) {
        return undefined;
      }
      return JSON.parse(serialState);
    } catch (err) {
      return undefined;
    }
};

export const saveState = (state) => {
    try {
      const serialState = JSON.stringify(state);
      localStorage.setItem(prefix + 'appState', serialState);
    } catch(err) {
        console.log(err);
    }
};