export default function userRole(state = null, action) {
	switch (action.type) {
		case 'SET_USER_ROLE': {
			const { userRole } = action;

			return userRole;
		}
		default:
			return state;
	}
}
