import _ from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Actions from '@/actions';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import minidash from '@/modules/minidash';
import Persistence from '@/modules/Persistence';
import Form from '@ui/Form';
import TextField from '../ui/TextField';
import Pdf from "../../../static/Digitalna_Komora-Izjava_o_zaštiti_podataka.pdf";

class SignupDKForm extends Component {
	state = {
		agreed: false,
		submitting: false,
		jib: '',
		naziv: '',
        ime_i_prezime: '',
		email: '',
		password: '',
		repeatPassword: '',
        sellerActive: true
	};

	componentDidMount() {
		this._isMounted = true;
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

	handleSubmit = e => {
		e.preventDefault();
		if (this._pendingAJAX) {
			return;
		}
		let errors = [];

        const sellerActive = this.state.sellerActive;
		const jib = this.state.jib;
		const email = this.state.email;
		const password = this.state.password;
		const password_confirmation = this.state.repeatPassword;
		const naziv = this.state.naziv;
        const ime_i_prezime = this.state.ime_i_prezime;

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

		if (
			sellerActive && jib.length !== 13
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

            let data = { email, password, password_confirmation };
            if (sellerActive) {
                let nazivToSubmit = naziv.toUpperCase();
                data.naziv = nazivToSubmit;
                data.jib = jib;
            } else {
                data.ime_i_prezime = ime_i_prezime;
            }
	
			ajaxPOST({
				api: sellerActive ? '/auth/seller/register' : '/auth/buyer/register',
				data: data,
				infiniteRetries: false,
				success: response => {
					if (response.success && response.message == "OK") {
						Actions.setUser(response.data.user_data);
                        Actions.setUserRole(response.data.role);
						Persistence.set('user_token', response.data.token);
	
						window.location = '/';
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

    renderSellerSignupForm = () => {
        const { submitting } = this.state;
		const { i18n } = this.props;
        return (
            <Form
                onSubmit={this.handleSubmit}
                disabled={submitting}
                className={'form-vertical mt-4'}
            >
                <TextField
                    className={'mb-2 md:mb-5 w-full'}
                    placeholder={i18n('Ime i prezime*')}
                    value={this.state.ime}
                    onChange={e => this.setState({ime: e.target.value})}
                    maxLength="254"
                    required
                />
                <TextField
                    className={'mb-2 md:mb-5 w-full'}
                    placeholder={i18n('E-mail*')}
                    value={this.state.email}
                    onChange={e => this.setState({email: e.target.value})}
                    maxLength="254"
                    required
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
                    inputClassName={'uppercase'}
                    placeholder={i18n('Kompanija*')}
                    value={this.state.naziv}
                    onChange={e => this.setState({naziv: e.target.value})}
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
                    className={'mb-2 md:mb-4 w-full'}
                    placeholder={i18n('Ponovite Lozinku*')}
                    value={this.state.repeatPassword}
                    onChange={e => this.setState({repeatPassword: e.target.value})}
                    type="password"
                    maxLength="55"
                    autoComplete="new-password"
                    required
                />
                <div className="flex flex-col">
                    <div className="text-greyText text-xs mb-4">
                        <a className="cursor-pointer" onClick={this.onOpenPrivacyPolicy}>{i18n('Prijavljivanjem pristajem na')}<span className="text-orange">{' '}{i18n('Pravila i uslove korištenja')}</span><br/><div>{' '}{i18n('Digitalne Komore')}</div></a>
                    </div>
                    <button className="button login-button ml-auto mr-auto w-full" type="submit">
                        {i18n('Prijavite se')}
                    </button>
                </div>
            </Form>
        )
    }

    renderPartnerSignupForm = () => {
        const { submitting } = this.state;
		const { i18n } = this.props;
        return (
            <Form
                onSubmit={this.handleSubmit}
                disabled={submitting}
                className={'form-vertical-full mt-4 h-full'}
            >
                <TextField
                    className={'mb-2 md:mb-5 w-full'}
                    placeholder={i18n('Ime i prezime*')}
                    value={this.state.ime_i_prezime}
                    onChange={e => this.setState({ime_i_prezime: e.target.value})}
                    maxLength="254"
                    required
                />
                <TextField
                    className={'mb-2 md:mb-5 w-full'}
                    placeholder={i18n('E-mail*')}
                    value={this.state.email}
                    onChange={e => this.setState({email: e.target.value})}
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
                <div className="flex flex-col mt-32">
                    <div className="text-greyText text-xs mb-4">
                        <a className="cursor-pointer" onClick={this.onOpenPrivacyPolicy}>{i18n('*Prijavljivanjem pristajem na')}<span className="text-orange">{' '}{i18n('Pravila i uslove korištenja')}</span><br/><div>{' '}{i18n('Digitalne Komore')}</div></a>
                    </div>
                    <button className="button login-button ml-auto mr-auto w-full" type="submit">
                        {i18n('Prijavite se')}
                    </button>
                </div>
            </Form>
        )
    }

	render() {
		const { sellerActive } = this.state;
		const { i18n, className } = this.props;

		return (
            <div className={minidash.cs(
                'dk-signup-form-container',
                className
            )}>
                <div className="dk-signup-tabs uppercase">
                    <div className={'dk-signup-tab' + (sellerActive ? ' active' : '')} onClick={() => this.setState({sellerActive: !sellerActive ? true : sellerActive})} >
                        {i18n('Proizvođač')}
                        {sellerActive && <div className="dk-signup-tab-caret"/>}
                    </div>
                    <div className={'dk-signup-tab' + (!sellerActive ? ' active' : '')} onClick={() => this.setState({sellerActive: sellerActive ? false : sellerActive})} >
                        {i18n('Partner')}
                        {!sellerActive && <div className="dk-signup-tab-caret"/>}
                    </div>
				</div>
                {sellerActive ? this.renderSellerSignupForm() : this.renderPartnerSignupForm()}
            </div>
		);
	}
}

export default withRouter(
	connect(state => ({
		i18n: state.i18n,
	}))(SignupDKForm)
);
