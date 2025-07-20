import _ from 'lodash';

import Hooks from '@/hooks';
import { useHistory, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import 'css/pages/home.css';
import SignupDKForm from './forms/SignupDKForm';
import DKTopBar from './ui/DKTopBar';
import Header from './ui/Header';
import Dropdown from './ui/Dropdown';
import Icon from './ui/Icon';

import 'css/pages/home.css';
import HomeMainCarousel from './ui/HomeMainCarousel';
import TrendingProducts from './ui/TrendingProducts';
import HighlightedProducts from './ui/HighlightedProducts';
import UserProfile from './ui/UserProfile';
import LoadingBar from 'react-top-loading-bar';

const HomeNavBar = () => {
	const i18n = Hooks.useI18n();

    const [activeTab, setActiveTab] = useState('pocetna');
    const [windowSize, setWindowSize] = useState(window.innerWidth);

	window.addEventListener(
		'resize',
		() => {
			setWindowSize(window.innerWidth);
		},
		false
	);

    return (
        windowSize >= 1024 ? (
            <div className="w-full home-nav-bar-container">
                <div className="home-nav-bar-content">
                    <div className="home-nav-padding" />
                    <div className="home-nav-tabs uppercase">
                        <div className={'home-nav-tab' + (activeTab == 'pocetna' ? ' active' : '')} onClick={() => setActiveTab('pocetna')} >
                            {i18n('Početna')}
                        </div>
                        <div className={'home-nav-tab' + (activeTab == 'baza' ? ' active' : '')} onClick={() => setActiveTab('baza')} >
                            <Link to="/seller_search">{i18n('Baza proizvođača')}</Link>
                        </div>
                        <div className={'home-nav-tab' + (activeTab == 'export' ? ' active' : '')} onClick={() => setActiveTab('export')} >
                            {i18n('Export')}
                        </div>
                        <div className={'home-nav-tab' + (activeTab == 'vijesti' ? ' active' : '')} onClick={() => setActiveTab('vijesti')} >
                            {i18n('Vijesti')}
                        </div>
                        <div className={'home-nav-tab' + (activeTab == 'edu' ? ' active' : '')} onClick={() => setActiveTab('edu')} >
                            {i18n('Edukacija')}
                        </div>
                        <div className={'home-nav-tab' + (activeTab == 'invest' ? ' active' : '')} onClick={() => setActiveTab('invest')} >
                            {i18n('Investi in bih')}
                        </div>
                        <div className={'home-nav-tab' + (activeTab == 'sert' ? ' active' : '')} onClick={() => setActiveTab('sert')} >
                            {i18n('Sertifikat')}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="my-4 mx-4">
                <Dropdown
                    className=""
                    label={i18n('Navigacija')}
                    onChange={e => setActiveTab(e)}
                    value={activeTab}
                >
                    <Dropdown.Item className={''} key={'pocetna'} value={'pocetna'} >
                        {i18n('Početna')}
                    </Dropdown.Item>
                    <Dropdown.Item className={''} key={'baza'} value={'baza'} >
                        {i18n('Baza proizvođača')}
                    </Dropdown.Item>
                    <Dropdown.Item className={''} key={'export'} value={'export'} >
                        {i18n('Export')}
                    </Dropdown.Item>
                    <Dropdown.Item className={''} key={'vijesti'} value={'vijesti'} >
                        {i18n('Vijesti')}
                    </Dropdown.Item>
                    <Dropdown.Item className={''} key={'edu'} value={'edu'} >
                        {i18n('Edukacija')}
                    </Dropdown.Item>
                    <Dropdown.Item className={''} key={'invest'} value={'invest'} >
                        {i18n('Investi in bih')}
                    </Dropdown.Item>
                    <Dropdown.Item className={''} key={'sert'} value={'sert'} >
                        {i18n('Sertifikat')}
                    </Dropdown.Item>
                </Dropdown>
            </div>
        )
    )
}

const Categories = () => {
	const i18n = Hooks.useI18n();
    const [HSKlasifikacije, setHSKlasifikacije] = useState();
    const [NACEKlasifikacije, setNACEKlasifikacije] = useState();
    const [klasifikacijeMode, setKlasifikacijeMode] = useState('hs');
	const history = useHistory(); 

    const onSearch = (codeSelected) => {
        if (klasifikacijeMode === 'hs') {
            history.push(`/product_search/''/${codeSelected.id}/${codeSelected.nivo}`);
        } else if (klasifikacijeMode === 'nace') {
            history.push(`/seller_search/''/${codeSelected.id}/${codeSelected.nivo}`);
        }
    }

    useEffect(() => {
        ajaxGET({
            api: '/hs',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let hs = response.data;
                    setHSKlasifikacije(hs);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
            },
            infiniteRetries: false,
        });
        ajaxGET({
            api: '/nace',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let nace = response.data;
                    setNACEKlasifikacije(nace);
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
        <div className="flex flex-col">
            <div className="home-categories-tabs mt-0 lg:mt-home-tabs">
                <div className={'home-categories-tab' + (klasifikacijeMode === 'hs' ? ' active' : '')} onClick={() => setKlasifikacijeMode('hs')} >
                    {i18n('Proizvodi')}
                    {klasifikacijeMode === 'hs' && <div className="home-categories-tab-caret"/>}
                </div>
                <div className={'home-categories-tab' + (klasifikacijeMode === 'nace' ? ' active' : '')} onClick={() => setKlasifikacijeMode('nace')} >
                    {i18n('Usluge')}
                    {klasifikacijeMode === 'nace' && <div className="home-categories-tab-caret"/>}
                </div>
            </div>
            <div className="home-categories-container home-tree-container max-w-none lg:max-w-home-cat-container">
                {klasifikacijeMode === 'hs' ? (
                    <ul className="home-tree">
                        {_.map(HSKlasifikacije, n => (
                            <li key={'l1' + n.id}>
                                <input type="checkbox" id={'l1' + n.id} />
                                <label className="home-tree_label  max-w-home-cat-label-mobile lg:max-w-home-cat-label  truncate" htmlFor={'l1' + n.id}><Icon className="mr-2 text-orange" icon="angle-right" />{i18n(n.opis)}</label>
                                <ul className="home-tree-second-level">
                                    {_.map(n.children, n2 => (
                                        <li onClick={() => onSearch(n2)} key={'l2' + n2.id}>
                                            <input type="checkbox" id={'l2' + n2.id} />
                                            <label htmlFor={'l2' + n2.id} className="home-tree_label max-w-home-cat-label-mobile lg:max-w-home-cat-label truncate">{i18n(n2.opis)}</label>
                                            <span className="float-right home-tree-category-id">{n2.id}</span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <ul className="home-tree">
                        {_.map(NACEKlasifikacije, n => (
                            <li key={'l1' + n.id}>
                                <input type="checkbox" id={'l1' + n.id} />
                                <label className="home-tree_label  max-w-home-cat-label-mobile lg:max-w-home-cat-label  truncate" htmlFor={'l1' + n.id}><Icon className="mr-2 text-orange" icon="angle-right" />{i18n(n.opis)}</label>
                                <ul className="home-tree-second-level">
                                    {_.map(n.children, n2 => (
                                        <li onClick={() => onSearch(n2)} key={'l2' + n2.id}>
                                            <input type="checkbox" id={'l2' + n2.id} />
                                            <label htmlFor={'l2' + n2.id} className="home-tree_label  max-w-home-cat-label-mobile lg:max-w-home-cat-label  truncate">{i18n(n2.opis)}</label>
                                            <span className="float-right home-tree-category-id">{n2.id}</span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

const YTVideo = () => {
    return (
        <div
            className={'home-yt-video-container mt-6 lg:mt-0'}
        >
            <iframe id="player" type="text/html"
                src="https://www.youtube.com/embed/N6ndRRKw1KE?enablejsapi=1&origin=https://digitalnakomora.ba&ab_channel=DigitalnaKomora"
                frameborder="0" />

        </div>
    )
}

const DKHome = () => {
	const i18n = Hooks.useI18n();
	const history = useHistory();
    const user = Hooks.useUser();
    const [progress, setProgress] = useState(0);
	Hooks.useTitle(i18n('Digitalna Komora'));

    const onSearch = (searchType, searchTerm) => {
        if (searchType === 'product') {
            history.push(`/product_search/${searchTerm}`);
        } else if (searchType === 'seller') {
            history.push(`/seller_search/${searchTerm}`);
        }
    }

	return (
        <>
            <LoadingBar
                color='#ec5020'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <DKTopBar />
            <Header onSearch={onSearch} />
            <HomeNavBar />
            <div className="flex flex-col-reverse lg:flex-row home-main-content">
                <Categories />
                <div className="w-full h-full">
                    <YTVideo />
                </div>
                {user ? (
                    <UserProfile className="home-signup mt-0 lg:ml-0 lg:mr-0"/>
                ) : (
                    <SignupDKForm className="home-signup mt-0 lg:ml-0 lg:mr-0" />
                )}
            </div>
            <div className="section-header uppercase">
                <div className="content-width">{i18n('Proizvodi u trendu')}</div>
            </div>
            <TrendingProducts className="my-8" onStartedLoad={() => setProgress(40)} onFinishedLoad={() => setProgress(100)} />
            <div className="section-header mt-10 uppercase">
                <div className="content-width">{i18n('Izdvojeni Proizvodi')}</div>
            </div>
            <HighlightedProducts className="ml-auto mr-auto pb-8 pt-10"/>
        </>
	);
};

export default DKHome;