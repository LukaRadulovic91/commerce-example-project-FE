export default function user(state = null, action) {
	switch (action.type) {
		case 'SET_USER': {
			const { user } = action;
			
			return user;
		}
		default:
			return state;
	}
}
