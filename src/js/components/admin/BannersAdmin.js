import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import { connect } from 'react-redux';
import Icon from '@ui/Icon';
import VerticalBanner from '../ui/VerticalBanner';
import HorizontalBanner from '../ui/HorizontalBanner';

const BannersAdmin = () => {
	const i18n = Hooks.useI18n();
    const [unsaved, setUnsaved] = useState(false);
    const [bannerV1, setBannerV1] = useState(null);
    const [bannerV2, setBannerV2] = useState(null);
    const [bannerH1, setBannerH1] = useState(null);
    const [bannerH2, setBannerH2] = useState(null);

    const submitBanners = () => {
        let bannersToSubmit = [];
        if (bannerV1 !== null) {
            bannerV1.position = 1;
            bannersToSubmit.push(bannerV1);
        }
        if (bannerV2 !== null) {
            bannerV2.position = 2;
            bannersToSubmit.push(bannerV2);
        }
        if (bannerH1 !== null) {
            bannerH1.position = 3;
            bannersToSubmit.push(bannerH1);
        }
        if (bannerH2 !== null) {
            bannerH2.position = 4;
            bannersToSubmit.push(bannerH2);
        }

        ajaxPOST({
            api: '/admin/banners/main',
            data: {
                content: bannersToSubmit,
            },
            auth: {
                token: Persistence.get('user_token'),
            },
            infiniteRetries: false,
            success: response => {
                if (response.success && response.message == "OK") {
                    // setBanners(response.data.content);
                    setUnsaved(false);
                    Actions.addModal('Ažuriranje uspješno!', '');
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
            },
        });
    }

    useEffect(() => {
        ajaxGET({
            api: '/content/banners/main',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let banners = response.data.content;
                    // setBanners(banners);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                if (status === 401) {
                    Actions.cleanupLogin(true);
                    window.location = '/login';
                }
            },
            infiniteRetries: false,
        });
	}, []);

    const VerticalBannerAdmin = (props) => {
        const banner = props.banner;
        const setBanner = props.setBanner;
        return (
            <div className="vertical-banner-admin">
                {banner !== null ? (
                    <div className={'hover-button-overlay'}>
                        <VerticalBanner banner={banner} />
                        <div className={'hover-button w-full h-full flex-col'}>
                            <div 
                                className="w-full h-1/2 cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                onClick={() => 
                                    Actions.showAddBannerModal(
                                        'Dodajte banner na glavnoj stranici',
                                        banner,
                                        'vertical',
                                        (banner) => {setBanner(banner); setUnsaved(true);},
                                    )}
                                >
                                <Icon icon="edit" />
                            </div>
                            <div 
                                className="w-full h-1/2 cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                onClick={() => {
                                    setBanner(null);
                                    setUnsaved(true);
                                }}
                                >
                                <Icon icon="trash" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="add-banner vertical cursor-pointer"
                        onClick={() => 
                            Actions.showAddBannerModal(
                                'Dodajte banner na glavnoj stranici',
                                banner,
                                'vertical',
                                (banner) => {setBanner(banner); setUnsaved(true);}
                            )
                    }>
                        <div className="add-banner-icon vertical cursor-pointer text-center">
                            <Icon icon="plus" />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const HorizontalBannerAdmin = (props) => {
        const banner = props.banner;
        const setBanner = props.setBanner;
        return (
            <div className="horizontal-banner-admin ml-auto mr-auto mb-8">
                {banner !== null ? (
                    <div className={'hover-button-overlay'}>
                        <HorizontalBanner banner={banner} />
                        <div className={'hover-button w-full h-full'}>
                            <div 
                                className="w-1/2 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                onClick={() => 
                                    Actions.showAddBannerModal(
                                        'Dodajte banner na glavnoj stranici',
                                        banner,
                                        'horizontal',
                                        (banner) => {setBanner(banner); setUnsaved(true);},
                                    )}
                                >
                                <Icon icon="edit" />
                            </div>
                            <div 
                                className="w-1/2 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                onClick={() => {
                                    setBanner(null);
                                    setUnsaved(true);
                                }}
                                >
                                <Icon icon="trash" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="add-banner horizontal cursor-pointer"
                        onClick={() => 
                            Actions.showAddBannerModal(
                                'Dodajte banner na glavnoj stranici',
                                banner,
                                'horizontal',
                                (banner) => {setBanner(banner); setUnsaved(true);}
                            )
                    }>
                        <div className="add-banner-icon horizontal cursor-pointer text-center">
                            <Icon icon="plus" />
                        </div>
                    </div>
                )}
                
            </div>
        );
    }

    return (
        <div className="mb-20">
            <div className="mb-10">{i18n('Pregled Bannera.')}</div>
            <div
                className={'admin-banners-content w-full h-full'}
            >
                <div className="flex flex-row">
                    <VerticalBannerAdmin banner={bannerV1} setBanner={setBannerV1} />
                    <div className="w-full h-full mt-20 text-center font-bold text-xl" >{i18n('Sadržaj glavne stranice')}</div>
                    <VerticalBannerAdmin banner={bannerV2} setBanner={setBannerV2} />
                </div>
                <div className="flex flex-col">
                    <HorizontalBannerAdmin banner={bannerH1} setBanner={setBannerH1} />
                    <HorizontalBannerAdmin banner={bannerH2} setBanner={setBannerH2} />
                </div>
            </div>
            <div className="flex flex-row flex-end mt-10">
                <div onClick={() => { setBannerV1(null); setBannerV2(null); setBannerH1(null); setBannerH2(null); setUnsaved(true); }} className="button signup-button mr-auto">
                    {i18n('Reset banera')}
                </div>
                <div 
                    className={'button login-button ml-auto' + (unsaved ? '' : ' disabled')}
                    onClick={() => submitBanners()}
                >
                    {i18n('Sačuvajte banere')}
                </div>
            </div>
        </div>
    )
}

export default connect(state => ({
	i18n: state.i18n,
}))(BannersAdmin);
