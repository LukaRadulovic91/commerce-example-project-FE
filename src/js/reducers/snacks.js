let snackID = 1;

export default function snacks(state = [], action) {
	switch (action.type) {
		case 'ADD_SNACK':
			action.snack.id = snackID++;
			return state.concat(action.snack);
		case 'CLOSE_SNACK':
			return state.filter(snack => snack.id !== action.id);
		default:
			return state;
	}
}
