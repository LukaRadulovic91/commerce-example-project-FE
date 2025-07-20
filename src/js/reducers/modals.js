let modalID = 1;

export default function modals(state = [], action) {
	switch (action.type) {
		case 'ADD_MODAL':
			if (document.activeElement !== null) {
				document.activeElement.blur();
			}
			if (action.modal.id === undefined) {
				action.modal.id = modalID++;
			} else {
				state = state.filter(modal => modal.id != action.modal.id);
			}

			return state.concat(action.modal);
		case 'CLOSE_MODAL':
			return state.filter(modal => {
				if (modal.id !== action.id) {
					return true;
				}
				if (typeof modal.onClose === 'function') {
					modal.onClose();
				}
				return false;
			});
		default:
			return state;
	}
}
