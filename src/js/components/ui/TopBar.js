import Hooks from '@/hooks';

import Actions from '@/actions';
import Persistence from '@/modules/Persistence';
import { ajaxPOST } from '@/modules/ajax';
import { Link } from 'react-router-dom';

const TopBar = (props) => {
    const i18n = Hooks.useI18n();
    
    const token = Persistence.get('user_token');
    const isAdmin = Persistence.get('is_admin');
    
    const handleLogout = e => {
        e.stopPropagation();
        Actions.confirm(
            i18n('Da li Ste sigurni?'),
            i18n(isAdmin ? 'Da li želite da napustite administrativni portal Digitalne Komore?' : 'Izmjene neće biti sačuvane.'),
            () => ajaxPOST({
                api: isAdmin ? '/auth/admin-logout' : '/auth/logout',
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
            })
        );
    };
    
	return (
        <div className='top-bar-background'>
            <div className={'flex flex-row top-bar' + ' ' + props.className}>
                <Link to="/" >
                    <div className="logo" />
                </Link>
                <div className="ml-auto logout-button" onClick={handleLogout}>
                    {i18n('Odjavite se')}
                </div>
            </div>
        </div>
	);
};

export default TopBar;