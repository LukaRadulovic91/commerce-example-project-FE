import Content from '@ui/Content';
import AdminLoginForm from './forms/AdminLoginForm';
import Hooks from '@/hooks';

import 'css/pages/home.css';

const AdminLogin = () => {
	const i18n = Hooks.useI18n();
	return (
		<Content>
			<div className="login-page-content">
				<AdminLoginForm />
			</div>
		</Content>
	);
};

export default AdminLogin;
