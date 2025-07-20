import _ from 'lodash';
import Content from '@ui/Content';
import { Fragment, useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { ajaxGET, handleError } from '@/modules/ajax';

import { ajaxPOST } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Loading from '@ui/Loading';

import Hooks from '@/hooks';

const VerifyEmail = () => {
    const i18n = Hooks.useI18n();
    const [verifying, setVerifying] = useState(true);
    const search = useLocation().search;
    const url = new URLSearchParams(search).get('action');

    useEffect(() => {
        ajaxGET({
            api: '/' + url,
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    Persistence.set('email_verification_pending', false)
                    setVerifying(false);
                    window.location = '/';
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
            },
            infiniteRetries: false,
        });
	}, []);

	return (
        <Content>
            <div className="login-page-content h-screen w-full ml-auto mr-auto mt-auto mb-auto">
                <Loading />
            </div>
        </Content>
	);
};
export default VerifyEmail;
