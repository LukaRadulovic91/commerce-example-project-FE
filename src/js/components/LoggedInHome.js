import _ from 'lodash';

import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link } from 'react-router-dom';
import { ajaxPOST } from '@/modules/ajax';
import Actions from '@/actions';
import ReduxState from '@/modules/ReduxState';

import Content from '@ui/Content';

import 'css/pages/home.css';

const LoggedInHome = () => {
	const i18n = Hooks.useI18n();
    const userData = Hooks.useUser();
    const ime = userData.name;
	Hooks.useTitle(i18n('Digitalna Komora'));
    const token = Persistence.get('user_token');

    const handleLogout = () => {
        ajaxPOST({
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
                    
                    window.location = '/login';
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
            },
        });
    };

	return (
		<Content className="content-home-bg-image">
			<div className="home-content">
                <div className="home-left-col">
                    <div className="logo" />
                    <div className="home-stinger text-orange text-xl mt-4">
                        <div>{i18n('Pitate se s kim i kako poslovati?')}</div>
                        <div>{i18n('Na pravom ste mjestu!')}</div>
                    </div>
                    <div className="home-welcome font-bold text-2xl mt-3">
                        {i18n('Dobrodošli, ')}{ime}
                    </div>
                    <div className="home-description text-greyText text-sm mt-4">
                        <div>{i18n('Digitalna komora je jedinstven ekosistem, koji objedinjuje proizvođače iz Bosne i Hercegovine na jednom mjestu, u cilju njihove prezentacije u digitalnom okruženju, te njihovog umrežavanja i povezivanja sa potencijalnim kupcima, kako na domaćem, tako i na inostranom tržištu.')}</div>
                        <br/>
                        <div>{i18n('U fokusu Digitalne komore je proizvod/usluga proizvedena u BiH, ali i dodatni alati i dokumenti koji će olakšati vaše uvozne, izvozne i ostale poslovne aktivnosti.')}</div>
                        <br/>
                        <div>{i18n('Za donošenje kvalitetnih poslovnih odluka i unapređenje vašeg poslovanja postanite dio DIGITALNE KOMORE.')}</div>
                    </div>
                    <div className="flex sm:flex-row xs:flex-col-reverse mt-10 mb-14">
                        <div onClick={handleLogout} className="button signup-button px-6 mr-4 sm:w-auto xs:w-full">
                            {i18n('Odjavite se')}
                        </div>
                        <Link to="/vtk_form" className="button login-button px-6 sm:mb-0 xs:mb-2 sm:w-auto xs:w-full">
                            {i18n('Uredite svoj profil')}
                        </Link>
                    </div>
                </div>
                <div className="home-right-col">
                    <div className="home-welcome-image small" />
                </div>
            </div>
			<div className="vtk_logo_wrapper">
				<div className="vtk_logo_horizontal mb-10" />
			</div>
		</Content>
	);
};

export default LoggedInHome;