export default function authenticating(state = false, action) {
	switch (action.type) {
		case 'SET_USER':
			if (action.user === null) {
				return state;
			}
			return false;
		case 'SET_AUTHENTICATING':
			return action.authenticating;
		default:
			return state;
	}
}
