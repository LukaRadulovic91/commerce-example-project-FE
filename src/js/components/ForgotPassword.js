import { Component } from 'react';
import { connect } from 'react-redux';

import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import Content from '@ui/Content';
import WelcomeHeader from './ui/WelcomeHeader';

import 'css/pages/home.css';

class ForgotPassword extends Component {
	render() {
		return (
			<div className="">
				<div className="content-bg-image" />
				<div className="login-page-content">
					<WelcomeHeader />
					<ForgotPasswordForm />
				</div>
			</div>
		);
	}
}

export default connect(state => ({
	i18n: state.i18n,
}))(ForgotPassword);
