import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import minidash from '@/modules/minidash';

import Hooks from '@/hooks';

const Footer = ({ className }) => {
	const i18n = Hooks.useI18n();
	const hideGlobalFooter = useSelector(state => state.hideGlobalFooter);
	if (global && hideGlobalFooter) {
		return null;
	}

    var isIE = /*@cc_on!@*/false || !!document.documentMode;

	return (
        <>
            {isIE && ( 
                <div
                    className={minidash.cs('relative text-greyText flex flex-col py-2 text-sm z-10 bg-white rounded-lg w-1/2 ml-auto mr-auto mt-10 text-center', className)}
                >
                    {i18n('Za najbolje iskustvo pri korištenju Digitalne Komore, molimo vas koristite jedan od pretraživača: Edge, Chrome, Mozilla Firefox, Safari ili Opera.')}
                </div>
            )}
        </>
	);
};

export default Footer;
