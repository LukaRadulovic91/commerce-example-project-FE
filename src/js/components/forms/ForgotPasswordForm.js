import _ from 'lodash';
import { useState, useRef } from 'react';

import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import History from '@/modules/History';
import Hooks from '@/hooks';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import { ForgotPasswordHeader } from '../ui/FormHeader';
import { useEffect } from 'react';
import { useParams, withRouter } from "react-router-dom";
import Actions from '@/actions';

const ForgotPasswordForm = props => {
	const i18n = Hooks.useI18n();
	const emailRef = useRef();
	const passwordRef = useRef();
	const repeatPasswordRef = useRef();
	const params = useParams();
	const [submitting, setSubmitting] = useState(false);
	const [sentEmail, setSentEmail] = useState(null);
	const [tokenValid, setTokenValid] = useState(null);

	const onSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
		}

		if (params?.token && tokenValid) {
			const token = params.token;
			const password = passwordRef.current.value.trim();
			const password_confirmation = repeatPasswordRef.current.value.trim();

			let errors = [];
	
			if (password.length < 8) {
				errors.push('Lozinka mora biti dugačka najmanje 8 karaktera');
			} else if (password !== password_confirmation) {
				errors.push(' Lozinke se ne poklapaju');
			}
	
			if (errors.length > 0) {
				let message = '';
				_.forEach(errors, (e, i) => (
					message = message.concat(e, i + 1 < errors.length ? ',' : '')
				));
				Actions.addModal('Greška', message);
			} else {
				setSubmitting(true);
				ajaxPOST({
					api: '/auth/reset-password',
					data: {
						token,
						password,
						password_confirmation
					},
					success: response => {
						if (response.success && response.message == "OK") {
							Actions.addModal('', i18n('Uspješno ste promjenili lozinku!'));
							History.push('/login');
						} else {
							Actions.addModal('Greška', response.message);
						}
					},
					finally: () => {
						setSubmitting(false);
					},
				});
			}
		} else {
			const email = emailRef.current.value.trim();
			if (
				email.length < 5 ||
				email.length > 254 ||
				email.indexOf('@') === -1 ||
				email.indexOf('.') === -1
			) {
				Actions.addModal('Greška', 'Nije validna email adresa');
			} else {
				setSubmitting(true);
				ajaxPOST({
					api: '/auth/forgot-password',
					data: {
						email,
					},
					success: response => {
						if (response.success && response.message == "OK") {
							setSentEmail(email);
						} else {
							Actions.addModal('Greška', response.message);
						}
					},
					finally: () => {
						setSubmitting(false);
					},
				});
			}
		}
	};

	const onCheckToken = () => {
		if (submitting) {
			return;
		}

		ajaxGET({
			api: '/auth/forgot-password/' + params?.token,
			success: response => {
				if (response.success && response.message == "OK") {
					setTokenValid(response.data.valid);
				} else {
					setTokenValid(false);
					Actions.addModal('Greška', response.message);
				}
			},
			finally: () => {
				setSubmitting(false);
			},
		});
	}

	const onFinish = e => {
		e.preventDefault();
		History.push('/login');
	};

	useEffect(() => {
		onCheckToken();
	}, [params]);

	useEffect(() => {
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
    })


	return ( 
        <div className="login-form-container mb-10">
			<ForgotPasswordHeader />
			{params?.token && tokenValid ? (
				<>
					<div className="xs:mx-10 sm:mx-20 mb-2 text-greyText">{i18n('Unesite novu lozinku.')}</div>
					<Form
						onSubmit={onSubmit}
						disabled={submitting}
						className={'form-vertical xs:mx-10 sm:mx-20 mt-4'}
					>
						<>
							<TextField
								className={'mb-2 md:mb-5 w-full'}
								placeholder={i18n('Lozinka')}
								ref={passwordRef}
								type="password"
								maxLength="55"
								autoComplete="new-password"
								required
							/>
							<TextField
								className={'mb-2 md:mb-5 w-full'}
								placeholder={i18n('Ponovite Lozinku')}
								ref={repeatPasswordRef}
								type="password"
								maxLength="55"
								autoComplete="new-password"
								required
							/>
							<div className="flex flex-row mt-20">
								<button className="button login-button ml-auto" type="submit">
									{!submitting ? i18n('Potvrdite') : <i className="fas fa-spinner fa-pulse" />}
								</button>
							</div>
						</>
					</Form>
				</>
			) : (
				<Form
					onSubmit={onSubmit}
					disabled={submitting}
					className={'form-vertical xs:mx-10 sm:mx-20 mt-4'}
				>
					{sentEmail ? (
						<>  
							<div className="text-greyText mb-2">
								{i18n('Poslali smo Vam mail na |MAIL| sa instrukcijama za resetovanje Vase lozinke.').replace(
									'|MAIL|',
									sentEmail
								)}
							</div>
							<br />
							<button className="button mt-4" type="submit" onClick={onFinish}>
								{i18n('Zatvorite')}
							</button>
						</>
					) : (
						<>
							<div className="mx-0 mb-4 text-greyText">{i18n('Unesite email adresu za koju želite promjeniti lozinku.')}</div>
							<TextField
								className={'mb-2 md:mb-5 w-full'}
								placeholder={i18n('E-mail*')}
								ref={emailRef}
								maxLength="254"
								required
							/>
							<div className="flex flex-row mt-20">
								<button className="button login-button ml-auto" type="submit">
									{!submitting ? i18n('Potvrdite') : <i className="fas fa-spinner fa-pulse" />}
								</button>
							</div>
						</>
					)}
				</Form>
			)}
		</div>
	);
};

export default withRouter(ForgotPasswordForm);
