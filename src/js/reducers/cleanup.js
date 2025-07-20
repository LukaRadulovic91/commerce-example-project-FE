import Persistence from '@/modules/Persistence';

export default function cleanupLogin(state = false, action) {
	switch (action.type) {
		case 'CLEANUP_LOGIN':
            Persistence.remove('seller_id');
            Persistence.remove('user_token');
            Persistence.remove('vtk_form_step_filled');
            Persistence.remove('seller_name');
            Persistence.remove('is_admin');

			return true;
		default:
			return state;
	}
}
