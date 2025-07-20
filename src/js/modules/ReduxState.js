let state = {};

export default {
	get: () => state,
	internalSet: v => {
		state = v;
	},
};
