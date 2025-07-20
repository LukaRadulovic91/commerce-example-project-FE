import _ from 'lodash';

import Hooks from '@/hooks';

import Content from '@ui/Content';

import 'css/pages/company_profile.css';
import TopBar from './ui/TopBar';
import CompanyProfileForm from './forms/CompanyProfileForm';

const CompanyProfile = () => {
	const i18n = Hooks.useI18n();
	Hooks.useTitle(i18n('Digitalna Komora'));

	return (
		<Content className="company-profile-content">
            <TopBar />
            <CompanyProfileForm />
		</Content>
	);
};

export default CompanyProfile;
