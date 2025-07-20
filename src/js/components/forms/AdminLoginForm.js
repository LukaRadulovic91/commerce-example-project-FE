import _ from 'lodash';
import { useState, useRef, useEffect } from 'react';

import Actions from '@/actions';
import { ajaxPOST } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import History from '@/modules/History';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import { LoginHeader } from '../ui/FormHeader';

const AdminLoginForm = props => {
	const i18n = Hooks.useI18n();
	const [submitting, setSubmitting] = useState(false);

	const emailRef = useRef();
	const passwordRef = useRef();
	
	const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
		}

		const email = emailRef.current.value.trim();
		const password = passwordRef.current.value;

		setSubmitting(true);
		Actions.setAuthenticating(true);
		ajaxPOST({
			api: '/auth/admin-login',
			data: {
				email,
				password,
			},
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
					Persistence.set('user_token', response.data.token);
					Persistence.set('is_admin', true);

					window.location = '/admin';
				} else {
					Actions.addModal('Greška', i18n(response.message));
				}
			},
			finally: () => {
				setSubmitting(false);
				Actions.setAuthenticating(false);
			},
		});
	};


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
		<div className="login-form-container mt-20">
			<LoginHeader hideInstructions className="mb-10" isAdmin />
			<Form
				onSubmit={handleSubmit}
				disabled={submitting}
				className={'form-vertical xs:mx-10 sm:mx-20 mt-4'}
			>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					placeholder={i18n('E-mail')}
					ref={emailRef}
					maxLength="254"
					required
				/>
				<TextField
					className={'mb-2 md:mb-5 w-full'}
					placeholder={i18n('Lozinka')}
					ref={passwordRef}
					type="password"
					maxLength="55"
					autoComplete="new-password"
					required
				/>
				<div className="flex flex-row mt-10">
					<button className="button login-button ml-auto" type="submit">
						{i18n('Prijavite se')}
					</button>
				</div>
			</Form>
            <div className="mx-5 text-greyText mt-6 text-center">
                {i18n('Projekat je podržan od strane Vanjskotrgovinske komore BiH')}
            </div>
			<div className="vtk_logo mt-8" />
		</div>
	);
};
export default AdminLoginForm;
