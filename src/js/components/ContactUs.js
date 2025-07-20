import _ from 'lodash';

import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link, useHistory } from 'react-router-dom';
import { ajaxPOST, handleError } from '@/modules/ajax';
import Actions from '@/actions';

import Content from '@ui/Content';

import 'css/pages/home.css';
import TextField from './ui/TextField';
import { useState } from 'react';
import DKTopBar from './ui/DKTopBar';
import Header from './ui/Header';

const ContactUs = () => {
	const i18n = Hooks.useI18n();
    const userData = Hooks.useUser();
    const history = useHistory();
    const email = userData?.email ? userData?.email : '';
    const [submittedEmail, setSubmittedEmail] = useState(email);
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
	Hooks.useTitle(i18n('Digitalna Komora'));

    const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
        }
        
		setSubmitting(true);
		ajaxPOST({
			api: '/contact-us/save',
			data: {
                name: name,
                email: submittedEmail,
                subject: subject,
                message: message
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message === "OK") {
                    Actions.addModal('Hvala Vam što ste nas kontaktirali', '');
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
			},
            error: (status, errorMessage) => {
                handleError(status, errorMessage);
			},
			finally: () => {
				setSubmitting(false);
			},
		});
    };

    const onSearch = (searchType, searchTerm) => {
        if (searchType === 'seller') {
            history.push(`/seller_search/${searchTerm}`);
        } else if (searchType === 'product') {
            history.push(`/product_search/${searchTerm}`);
        }
    }

	return (
        <>
            <DKTopBar />
            <Header onSearch={onSearch} />
            <Content className="content-home-bg-image">
                <div className="home-content pb-20">
                    <div className="mx-2 w-full">
                    <div className="text-xl">{i18n('Kontaktirajte nas')}</div>
                        {!userData || !userData.email ? (
                            <>
                                <div className="vtk-seller-field-label">{i18n('Email*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="254"
                                    type="email"
                                    value={submittedEmail}
                                    onChange={e => setSubmittedEmail(e.target.value)}
                                />
                            </>
                        ) : (
                            <div />
                        )}
                        <div className="vtk-seller-field-label">{i18n('Ime i prezime')}</div>
                        <TextField
                            className={'vtk-seller-field-input'}
                            maxLength="254"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <div className="vtk-seller-field-label">{i18n('Subjekt')}</div>
                        <TextField
                            className={'vtk-seller-field-input'}
                            maxLength="254"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        />
                        <div className="w-full flex flex-col">
                            <div className="vtk-seller-field-label">{i18n('Sadržaj poruke')}</div>
                            <textarea
                                className="vtk-seller-field-input attention-border h-28 w-full"
                                maxLength="8192"
                                required
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                            />
                        </div>
                        <div className="w-full flex flex-row">
                            <button className="button login-button ml-auto mt-8" onClick={() => handleSubmit()}>
                                {i18n('Pošaljite poruku')}
                            </button>
                        </div>
                    </div>
                </div>
            </Content>
        </>
	);
};

export default ContactUs;