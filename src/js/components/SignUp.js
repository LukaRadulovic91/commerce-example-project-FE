import { Component } from 'react';
import { connect } from 'react-redux';

import SignupForm from '@/components/forms/SignupForm';
import Content from '@ui/Content';
import WelcomeHeader from './ui/WelcomeHeader';

import 'css/pages/home.css';
import SignupDKForm from './forms/SignupDKForm';

class SignUp extends Component {
	render() {
		const { i18n } = this.props;
		return (
			<Content>
				<div className="login-page-content">
					<WelcomeHeader />
					<div className="login-form-container pt-10 pb-10 mb-10">
						<SignupDKForm />
					</div>
				</div>
			</Content>
		);
	}
}

export default connect(state => ({
	i18n: state.i18n,
}))(SignUp);
