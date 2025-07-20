import _ from 'lodash';

import Hooks from '@/hooks';
import Loading from '@ui/Loading';
import Icon from '@ui/Icon';
import { Link } from 'react-router-dom';

const CompanyList = ({
	companies
}) => {
	const i18n = Hooks.useI18n();

	if (companies === false) {
		return <Loading />;
	}
    
	return (
        <div className="product-results-list">
            {_.map(companies, (company, index) => (
                <Link to={'/company/' + company.id} className={'flex flex-col md:flex-row product-results-list-item mx-2 my-5'} key={company.id} index={index}>
                    {/* TODO Fix logo size to ensure uniform list appearance */}
                    {company.photo_logo ? <img className="product-results-list-image ml-auto mr-auto md:ml-0 md:mr-0" src={company.photo_logo?.url}/> : <i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i>}
                    <div className="block md:hidden divider" />
                    <div className="flex flex-row w-full">
                        <div className="p-4 mt-auto mb-auto h-full flex flex-col text-lg w-2/3">
                            <div className={'font-bold'}>
                                {company.naziv}
                            </div>
                            <div className={''}>
                                {company.adresa}
                            </div>
                            <div className={''}>
                                {company.mjesto?.postanski_broj}{' '}{company.mjesto?.naziv}{', '}{company.mjesto?.opstina?.naziv}
                            </div>

                            <div className={'mt-auto'}>
                                {company.website}
                            </div>
                            <div className={''}>
                                {company.email}
                            </div>
                        </div>
                        <div className="p-4 mt-auto mb-auto h-full flex flex-col text-lg w-1/2 md:w-1/3 product-results-list-details">
                            <div className={'company-list-description'}>
                                <span className={'font-bold'}>{i18n('Djelatnost:')}</span>{' '}<span className="">{company.vrsta_djelatnosti}</span>
                            </div>
                            <div className={'mt-auto'}>
                                {i18n('Godina osnivanja:')}{' '}{company.godina_osnivanja}
                            </div>
                            <div className={''}>
                                {i18n('White Label:')}{' '}{company.white_label ? i18n('Da') : i18n('Ne')}
                            </div>
                        </div>
                        <div className="product-results-list-details-button secondary-action-color">
                            <Icon icon="angle-right" size={'2x'} className="text-white" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
	);
};

export default CompanyList;
