export default function viewportDevice(state = null, action) {
	switch (action.type) {
		case 'SET_VIEWPORT_DEVICE':
			return action.viewportDevice;
		default:
			return state;
	}
}
