import _ from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Actions from '@/actions';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import FormHeader from '../ui/FormHeader';
import Form from '@ui/Form';
import TextField from '../ui/TextField';
import Checkbox from '../ui/Checkbox';
import Pdf from "../../../static/Digitalna_Komora-Izjava_o_zaštiti_podataka.pdf";

class SignupForm extends Component {
	state = {
		agreed: false,
		submitting: false,
		jib: '',
		naziv: '',
		email: '',
		password: '',
		repeatPassword: '',
		validToken: false,
	};

	componentDidMount() {
		this._isMounted = true;
		
		if (this.props.match.params.token) {
			ajaxGET({
				api: '/auth/invitation/' + this.props.match.params.token,
				handleIf: () => this._isMounted,
				success: response => {
					if (response.success && response.message == "OK") {
						this.setState({
							id: response.data.id,
							jib: response.data.jib,
							naziv: response.data.naziv,
							email: response.data.email,
							validToken: true,
						});
					} else {
						Actions.addModal('Greška', response.message);
					}
				},
			});
		}
		var elements = document.getElementsByTagName("INPUT");
		for (var i = 0; i < elements.length; i++) {
			elements[i].oninvalid = function(e) {
				e.target.setCustomValidity("");
				if (e.target.validity.valueMissing) {
					e.target.setCustomValidity("Polje ne smije biti prazno");
				} else if(e.target.validity.tooLong) {
					e.target.setCustomValidity("Predugačak unos");
				} else if(e.target.validity.tooShort) {
					e.target.setCustomValidity("Prekratak unos");
				} else if(e.target.validity.typeMismatch) {
					e.target.setCustomValidity("Pogrešan tip unosa");
				} else if (!e.target.validity.valid) {
					e.target.setCustomValidity("Molimo provjerite unos");
				}
			};
			elements[i].oninput = function(e) {
				e.target.setCustomValidity("");
			};
		}
	}
	
	componentWillUnmount() {
		this._isMounted = false;
	}

	handleToggleTerms = () => {
		this.setState(prevState => ({ agreed: !prevState.agreed }))
	};

	handleValidate = e => {
		e.preventDefault();

		this._jib.setCustomValidity('')
		this._email.setCustomValidity('');
		this._password.setCustomValidity('');

		const password = this._password.value.trim();
		if (password.length < 6) {
			this._password.setCustomValidity('Vaša lozinka mora biti dugačka najmanje 6 karaktera.');
			this._password.reportValidity();
			return;
		} else if (password !== this._repeatPassword.value.trim()) {
			this._repeatPassword.setCustomValidity('Vaša lozinka se ne poklapa sa ponovljenom lozinkom');
			this._repeatPassword.reportValidity();
			return;
		}

		const email = this._email.value.trim();
		if (
			email.length < 5 ||
			email.length > 254 ||
			email.indexOf('@') === -1 ||
			email.indexOf('.') === -1
		) {
			this._email.setCustomValidity('Nije validna e-mail adresa.');
			this._email.reportValidity();
			return;
		}

	};

	handleSubmit = e => {
		e.preventDefault();
		if (this._pendingAJAX) {
			return;
		}
		let errors = [];

		const jib = this.state.jib;
		const email = this.state.email;
		const password = this.state.password;
		const password_confirmation = this.state.repeatPassword;
		const naziv = this.state.naziv;
		const agreed = this.state.agreed;

		if (password.length < 8) {
			errors.push('Lozinka mora biti dugačka najmanje 8 karaktera');
		} else if (password !== password_confirmation) {
			errors.push(' Lozinke se ne poklapaju');
		}

		if (
			email.length < 5 ||
			email.length > 254 ||
			email.indexOf('@') === -1 ||
			email.indexOf('.') === -1
		) {
			errors.push(' Nije validna email adresa');
		}

		if (!agreed) {
			errors.push(' Molimo Vas da prihvatite uslove korištenja')
		}
		
		if (
			jib.length !== 13
		) {
			errors.push(' JIB mora sadržavati 13 cifara');
		}

		if (errors.length > 0) {
			let message = '';
			_.forEach(errors, (e, i) => (
				message = message.concat(e, i + 1 < errors.length ? ',' : '')
			));
			Actions.addModal('Greška', message);
		} else {
			this.setState({
				submitting: true,
			});
			this._pendingAJAX = true;
			Actions.setAuthenticating(true);

			let nazivToSubmit = naziv.toUpperCase();
	
			ajaxPOST({
				api: '/auth/register',
				data: {
					jib,
					email,
					password,
					password_confirmation,
					naziv: nazivToSubmit,
				},
				infiniteRetries: false,
				success: response => {
					if (response.success && response.message == "OK") {
						Actions.setUser(response.data.user_data);
						Actions.setUserRole(response.data.role);
	
						// Persistence.set('seller_id', response.data.user_data.id);
						Persistence.set('user_token', response.data.token);
						// Persistence.set('seller_name', response.data.user_data.naziv);
	
						window.location = '/vtk_form';
					} else {
						Actions.addModal('Greška', response.message);
					}
				},
				error: () => Actions.setAuthenticating(false),
				finally: () => {
					if (!this._isMounted) {
						return;
					}
	
					this._pendingAJAX = false;
					this.setState({
						submitting: false,
					});
				},
			});
		}

	};

	onOpenPrivacyPolicy = () => {
		window.open(Pdf);
	}

	render() {
		const { submitting } = this.state;
		const { i18n } = this.props;

		return (
			<div className="login-form-container">
			<FormHeader />
			<Form
				onSubmit={this.handleSubmit}
				disabled={submitting}
				className={'form-vertical xs:mx-10 sm:mx-20 mt-4'}
			>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					inputClassName={'uppercase'}
					placeholder={i18n('Ime privrednog subjekta')}
					value={this.state.naziv}
					onChange={e => this.setState({naziv: e.target.value})}
					readOnly={this.state.validToken}
					maxLength="254"
				/>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					placeholder={i18n('JIB*')}
					value={this.state.jib}
					onChange={e => this.setState({jib: e.target.value})}
					readOnly={this.state.validToken}
					maxLength="254"
					required
				/>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					placeholder={i18n('E-mail*')}
					value={this.state.email}
					onChange={e => this.setState({email: e.target.value})}
					readOnly={this.state.validToken}
					maxLength="254"
					required
				/>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					placeholder={i18n('Lozinka*')}
					value={this.state.password}
					onChange={e => this.setState({password: e.target.value})}
					type="password"
					maxLength="55"
					autoComplete="new-password"
					required
				/>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					placeholder={i18n('Ponovite Lozinku*')}
					value={this.state.repeatPassword}
					onChange={e => this.setState({repeatPassword: e.target.value})}
					type="password"
					maxLength="55"
					autoComplete="new-password"
					required
				/>
				<div className="flex flex-row flex-wrap mt-20">
					<div>
						<Checkbox
							onChange={this.handleToggleTerms}
							checked={this.state.agreed}
							label={
								<div className="text-greyText">{i18n('Prihvatam uslove korištenja')}</div>
							}
						/>
						<div className="text-greyText mb-4">
							<a className="cursor-pointer" onClick={this.onOpenPrivacyPolicy}>{i18n('Pročitajte opšta pravila i uslove korištenja')}<span className="text-orange">{' '}{i18n('ovdje')}</span></a>
						</div>
					</div>
					<button className="button login-button ml-auto" type="submit">
						{i18n('Registrujte se')}
					</button>
				</div>
				<div className="mt-8 text-greyText">{i18n('U slučaju da imate poteškoće pri registraciji obratite nam se na support@digitalnakomora.ba ili na broj telefona +387 33 843 910')}</div>
			</Form>
		</div>
		);
	}
}

export default withRouter(
	connect(state => ({
		i18n: state.i18n,
	}))(SignupForm)
);
