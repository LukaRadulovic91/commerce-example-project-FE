import Hooks from '@/hooks';
// import _ from 'lodash';

import { useHistory } from 'react-router-dom';
import Actions from '@/actions';
import Persistence from '@/modules/Persistence';
import { ajaxPOST } from '@/modules/ajax';
import Icon from '@ui/Icon';
// import Dropdown from '@ui/Dropdown';
// import { languages } from '@/models/languages';
// import { useState } from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
  } from "react-share";

const DKTopBar = (props) => {
    const i18n = Hooks.useI18n();
	const user = Hooks.useUser();
    const history = useHistory();
    const token = Persistence.get('user_token');
    // const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
    const shareURL = 'https://www.digitalnakomora.ba';

    const handleLogin = e => {
        e.stopPropagation();
        history.push('/login');
    };

    const handleLogout = e => {
        e.stopPropagation();
        Actions.confirm(
            i18n('Da li Ste sigurni?'),
            i18n(''),
            () => ajaxPOST({
                api: '/auth/logout',
                auth: {
                    token,
                },
                infiniteRetries: false,
                success: response => {
                    if (response.success && response.message == "OK") {
                        Actions.setUser(null);
                        Actions.setUserRole(null);
                        Actions.cleanupLogin(true);
                        window.location = '/';
                    } else {
                        Actions.addModal('Greška', i18n(response.message));
                    }
                },
            })
        );
    };
    
	return (
		<div className={'flex flex-row w-full ml-auto mr-auto top-bar'}>
            {/* <Dropdown
                className="top-bar-language-dropdown"
                onChange={e => setCurrentLanguage({e})}
                required
                value={currentLanguage}
            >
                {_.map(languages, lang => (
                    <Dropdown.Item key={lang.code} value={lang} className="">
                        {lang.name}
                    </Dropdown.Item>
                ))}
            </Dropdown> */}
            <FacebookShareButton url={shareURL} className="px-1 ml-3 hover:text-actionOrange">
                <Icon icon={['fab', "facebook-square"]} size="2x" />
            </FacebookShareButton>
            <TwitterShareButton url={shareURL} className="px-1 hover:text-actionOrange" >
                <Icon icon={['fab', "twitter-square"]} size="2x" />
            </TwitterShareButton>
            <LinkedinShareButton url={shareURL} className="px-1 hover:text-actionOrange" >
                <Icon icon={['fab', "linkedin"]} size="2x" />
            </LinkedinShareButton>
            {user ? (
                <div className="ml-auto logout-button" onClick={handleLogout}>
                    {i18n('Odjavite se')}
                </div>
            ) : (
                <div className="button login-button ml-auto" onClick={handleLogin}>
                    {i18n('Prijavite se')}
                </div>
            )}
		</div>
	);
};

export default DKTopBar;