import { Fragment, useState } from 'react';

import { ajaxPOST } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Actions from '@/actions';

import Hooks from '@/hooks';

const VerifyEmailModal = ({ title, handleClose }) => {
    const i18n = Hooks.useI18n();
    const userData = Hooks.useUser();
    const [emailSent, setEmailSent] = useState(false);
    const [content, setContent] = useState(i18n('Kliknite "Potvrdi" da bi ste dobili verifikacijski email na ') + userData.email);

    const onVerify = () => {
        ajaxPOST({
			api: '/email/verification-notification',
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message === "OK") {
                    setContent(i18n('Verifikacijski email uspješno poslan na ') + userData.email);
                    setEmailSent(true);
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
			},
            error: (status, errorMessage) => {
				if (status === 401) {
                    Actions.cleanupLogin(true);
                    window.location = '/login';
                }
			},
		});
    };

	return (
		<Fragment>
			<div className="mt-10 mx-12 font-bold text-xl">{i18n(title)}</div>
            <div className="mx-12 my-4">
                {content}
            </div>
            <div className="flex flex-row mt-10 mb-10 mx-12">
                {emailSent && 
                    <button className="button signup-button mr-auto" onClick={handleClose}>
                        {i18n('Zatvori')}
                    </button>
                }
                {!emailSent && 
                    <button className="button login-button ml-auto" onClick={() => {
                        onVerify();
                    }}>
                        {i18n('Potvrdi')}
                    </button>
                }
            </div>
		</Fragment>
	);
};
export default VerifyEmailModal;
