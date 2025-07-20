import History from '@/modules/History';

import LoginForm from '@/components/forms/LoginForm';
import WelcomeHeader from './ui/WelcomeHeader';

import 'css/pages/home.css';

const Login = () => {
	const handleLogin = () => History.push('/');
	return (
		<div className="">
			<div className="content-bg-image" />
			<div className="login-page-content">
				<WelcomeHeader />
				<LoginForm onLogin={handleLogin} />
			</div>
		</div>
	);
};

export default Login;
