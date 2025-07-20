import Hooks from '@/hooks';

import { useState, useEffect } from 'react';
import _ from 'lodash';
import { useParams, useHistory } from 'react-router-dom';
import { ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import DKTopBar from './ui/DKTopBar';
import Header from './ui/Header';
import Loading from '@ui/Loading';
import Icon from '@ui/Icon';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import Breadcrumbs from '@ui/Breadcrumbs';
import LoadingBar from 'react-top-loading-bar';

const Company = () => {
	const i18n = Hooks.useI18n();
	const history = useHistory();
    const [progress, setProgress] = useState(0);
    const { id } = useParams();
    const [seller, setSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
	const [showVideo, setShowVideo] = useState(false);
	Hooks.useTitle(i18n('Digitalna Komora'));

    useEffect(() => {
        setProgress(50);
        ajaxGET({
            api: '/profile/sellers/' + id,
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message === "OK") {
                    let seller = response.data;
                    setSeller(seller);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
            finally: () => {
                setProgress(100);
            },
            infiniteRetries: false,
        });
        ajaxGET({
            api: '/sellers/' + id + '/proizvodi?per_page=5&page=1',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message === "OK") {
                    let products = response.data;
                    setSellerProducts(products);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
            },
            finally: () => {
                setProgress(100);
            },
            infiniteRetries: false,
        });
	}, [id]);

    useEffect(() => {
        if (seller) {
            setProgress(75);
            ajaxGET({
                api: '/sellers/' + seller.id + '/proizvodi?per_page=5&page=1',
                auth: {
                    token: Persistence.get('user_token'),
                },
                success: response => {
                    if (response.success && response.message === "OK") {
                        let products = response.data;
                        setSellerProducts(products);
                    } else {
                    }  
                },
                error: (status, errorMessage) => {
                    handleError(status, errorMessage)
                },
                finally: () => {
                    setProgress(100);
                },
                infiniteRetries: false,
            });
        }
	}, [seller]);


    const onSearch = (searchType, searchTerm) => {
        if (searchType === 'product') {
            history.push(`/product_search/${searchTerm}`);
        } else if (searchType === 'seller') {
            history.push(`/seller_search/${searchTerm}`);
        }
    }

    const handleVideoPlay = () => {
        const isEmbed = seller.link_promo_video?.includes('/embed/');
        if (isEmbed) {
            setShowVideo(true);
        } else {
            window.open((seller.link_promo_video?.includes('http://') || seller.link_promo_video?.includes('https://')) ? seller.link_promo_video : ('https://' + seller.link_promo_video), "_blank")
        }
    }

    if (!seller) {
        return(
            <>
                <DKTopBar />
                <Header onSearch={onSearch}/>
                <Loading />
            </>
        )
    }

	return (
        <>
            {showVideo && (
				<div onClick={() => setShowVideo(!showVideo)} className="fixed w-full h-full pin z-50 overflow-auto bg-black-semitransparent flex">
					<div className="ml-auto mr-auto mt-auto mb-auto">
						<iframe title="Promo video" id="player" type="text/html" width="800" height="600"
							src={seller.link_promo_video}
							frameBorder="0" />
					</div>
					
				</div>
			)}
            <LoadingBar
                color='#ec5020'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <DKTopBar />
            <Header onSearch={onSearch}/>
            <div className="product-view-container px-content-mobile md:px-content">
                <div className="mt-6 mb-2 ml-4">
                    <Breadcrumbs />
                </div>
                <div className="product-view mt-10">
                    <div className="flex flex-col lg:flex-row pb-10 lg:pb-0 bg-lightGray">
                        <img className="product-view-image" src={seller.photo_logo?.url}/>
                        <div className="flex flex-col sm:flex-row w-full">
                            <div className="pl-6 lg:p-4 mt-auto mb-auto h-full flex flex-col text-lg w-4/5">
                                <div className={'font-bold text-4xl h-full flex items-center'}>
                                    {seller.naziv}
                                </div>
                            </div>
                            <div className="pl-6 lg:p-4 h-full flex items-center text-lg">
                                <div>
                                    <div className={''}>
                                        {seller.adresa}
                                    </div>
                                    <div className={''}>
                                        {seller.mjesto?.postanski_broj}{' '}{seller.mjesto?.naziv}{seller.mjesto?.naziv ? ', ' : ''}{seller.mjesto?.opstina?.naziv}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-actionYellow text-black flex flex-col lg:flex-row font-semibold text-xl px-6">
                        <div className="details-view-section-header w-full lg:w-1/3">
                            <a href={(seller.website?.includes('http://') || seller.website?.includes('https://')) ? seller.website : ('https://' + seller.website)} rel="noreferrer" target="_blank">{seller.website}</a>
                        </div>
                        <div className="details-view-section-header w-full lg:w-1/3 lg:text-center">
                            <a href={'mailto:' + seller.email}>{seller.email}</a>
                        </div>
                        <div className="details-view-section-header w-full lg:w-1/3 lg:text-right">
                            <a href={'tel:' + seller.telefon}>{seller.telefon}</a>
                        </div>
                    </div>

                    <div className="flex flex-wrap flex-row text-lg pt-3 pb-1">
                            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-row justify-center items-center py-2">
                                <div className="descriptor-circle flex flex-row items-center">
                                    <span className="fa-stack fa-2x">
                                        <i className="fas fa-circle fa-stack-2x gray-circle-icon"></i>
                                        <i className="fas fa-calendar-alt fa-stack-1x text-orangeIcon"></i>
                                    </span>
                                    <span className="flex flex-col">
                                        <div>{i18n('Godina osnivanja')}</div>
                                        <div className="font-bold w-full">{seller.godina_osnivanja}</div>
                                    </span>
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-row justify-center items-center py-2">
                                <div className="descriptor-circle flex flex-row items-center">
                                    <span className="fa-stack fa-2x">
                                        <i className="fas fa-circle fa-stack-2x gray-circle-icon"></i>
                                        <i className="fas fa-address-card fa-stack-1x text-orangeIcon"></i>
                                    </span>
                                    <span className="flex flex-col">
                                        <div>{i18n('JIB/ID')}</div>
                                        <div className="font-bold w-full">{seller.jib}</div>
                                    </span>
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-row justify-center items-center py-2">
                            <div className="descriptor-circle flex flex-row items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x gray-circle-icon"></i>
                                    <i className="fas fa-users fa-stack-1x text-orangeIcon"></i>
                                </span>
                                <span className="flex flex-col">
                                    <div>{i18n('Broj zaposlenih')}</div>
                                    <div className="font-bold w-full">{seller.broj_zaposlenih}</div>
                                </span>
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-row justify-center items-center py-2">
                            <div className="descriptor-circle flex flex-row items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x gray-circle-icon"></i>
                                    <i className="fas fa-coins fa-stack-1x text-orangeIcon"></i>
                                </span>
                                <span className="flex flex-col">
                                    <div>{i18n('Godišnji promet')}</div>
                                    <div className="font-bold w-full">{seller.godisnji_prihod}</div>
                                </span>
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-row  justify-center items-center py-2">
                            <div className="descriptor-circle flex flex-row items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x gray-circle-icon"></i>
                                    <i className="fas fa-chart-bar fa-stack-1x text-orangeIcon"></i>
                                </span>
                                <span className="flex flex-col">
                                    <div>{i18n('Orjentacija')}</div>
                                    <div className="font-bold w-full">{seller.trzisna_orijentacija_uvoz ? (i18n('Uvoz') + '/') : ''}{seller.trzisna_orijentacija_izvoz ? (i18n('Izvoz') + '/') : ''}{seller.trzisna_orijentacija_domace ? i18n('Domaće') : ''}</div>
                                </span>
                                </div>
                            </div>
                            <div className="w-full sm:w-1/2 lg:w-1/3 flex flex-row justify-center items-center py-2">
                            <div className="descriptor-circle flex flex-row items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x gray-circle-icon"></i>
                                    <i className="fas fa-industry fa-stack-1x text-orangeIcon"></i>
                                </span>
                                <span className="flex flex-col">
                                    <div>{i18n('White label')}</div>
                                    <div className="font-bold w-full">{seller.white_label ? 'DA' : 'NE'}</div>
                                </span>
                                </div>
                            </div>
                    </div>

                    {seller.aktivnosti_kompanije && (
                        <>
                            <div className="detail-view-section-header-yellow">
                                {i18n('O nama')}
                            </div>
                            <div className="py-4 text-lg">
                                {seller.aktivnosti_kompanije}
                            </div>
                        </>
                    )}
                    {(seller.link_katalog_pdf || seller.link_promo_video) && (
                        <>
                            <div className="detail-view-section-header-yellow">
                                {i18n('Promotivni materijal')}
                            </div>
                            <div className="flex flex-col md:flex-row text-xl py-6">
                                {seller.link_katalog_pdf && <div className="w-1/2 flex flex-row items-center justify-center"><a className="flex flex-row items-center" href={(seller.link_katalog_pdf?.includes('http://') || seller.link_katalog_pdf?.includes('https://')) ? seller.link_katalog_pdf : ('https://' + seller.link_katalog_pdf)} target="_blank" rel="noopener noreferrer"><Icon icon="file-pdf" size={'2x'} className="text-orangeIcon mr-4"/><div className="flex items-center">{i18n('Preuzmite katalog u PDF formatu')}</div></a></div>}
                                {seller.link_promo_video && <div className="pt-4 md:pt-0 w-1/2 flex items-center justify-center"><FontAwesomeIcon onClick={handleVideoPlay} icon={faPlayCircle} size={'2x'} className="text-orangeIcon mr-4 cursor-pointer"/><div className="cursor-pointer" onClick={handleVideoPlay}>{i18n('Pogledajte naš promotivni video')}</div></div>}
                            </div>
                        </>
                    )}
                    {seller.certifikati_dozvole_i_licence && (
                        <>
                            <div className="detail-view-section-header-yellow">
                                {i18n('Informacije o sertifikacijama, dozvolama i licencama')}
                            </div>
                            <div className="flex flex-row text-lg py-6">
                                {seller.certifikati_dozvole_i_licence}
                            </div>
                        </>
                    )}
                    {seller.reference && (
                        <div className="flex flex-col text-lg py-6">
                            <div className="detail-view-section-header-yellow">
                                {i18n('Reference')}
                            </div>
                            {seller.reference}
                        </div>
                    )}


                    {sellerProducts && sellerProducts?.length > 0 && (
                        <>
                            <div className="detail-view-section-header-yellow bg-actionYellow text-black mb-6">
                                {i18n('Proizvodi')}
                            </div>
                            <div className="mb-10 mt-11 flex flex-row whitespace-nowrap overflow-x-auto other-products-container">
                                {_.map(sellerProducts, (product, index) => (
                                    <Link to={'/product/' + product.id} className={'flex flex-col mx-5 my-2 product-results-list-item-image-container'} key={product.id} index={index}>
                                        {product.photo_1?.url ? <img className="product-results-list-image" src={product.photo_1?.url}/> : <i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i>}
                                        <div className="product-name text-center mt-5 text-lg">
                                            {product.naziv}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                    
                    {(seller.kontakt_osoba_ime || seller.kontakt_osoba_pozicija || seller.kontakt_osoba_telefon || seller.kontakt_osoba_email) && (
                        <>
                            <div className="detail-view-section-header-yellow bg-actionYellow text-black mb-6">
                                {i18n('Kontakt osoba za informacije o proizvodima ili uslugama')}
                            </div>
                            <div className="mb-20 flex flex-col md:flex-row">
                                <div className="detail-view-contact-info w-1/4">
                                    <div className="detail-view-contact-info-label mb-2">
                                        {i18n('Ime i prezime')}
                                    </div>
                                    <div className="detail-view-contact-info-data mb-4 md:mb-8 font-bold">
                                        {seller.kontakt_osoba_ime}
                                    </div>
                                </div>
                                <div className="detail-view-contact-info w-1/4">
                                    <div className="detail-view-contact-info-label mb-2">
                                        {i18n('Pozicija u kompaniji')}
                                    </div>
                                    <div className="detail-view-contact-info-data mb-4 md:mb-8 font-bold">
                                        {seller.kontakt_osoba_pozicija}
                                    </div>
                                </div>
                                <div className="detail-view-contact-info w-1/4">
                                    <div className="detail-view-contact-info-label mb-2">
                                        {i18n('Direktan telefon')}
                                    </div>
                                    <div className="detail-view-contact-info-data mb-4 md:mb-8 font-bold">
                                        <a href={'tel:' + seller.kontakt_osoba_telefon}>{seller.kontakt_osoba_telefon}</a>
                                    </div>
                                </div>
                                <div className="detail-view-contact-info w-1/4">
                                    <div className="detail-view-contact-info-label mb-2">
                                        {i18n('Email')}
                                    </div>
                                    <div className="detail-view-contact-info-data mb-4 md:mb-8 font-bold">
                                    <a href={'mailto:' + seller.kontakt_osoba_email}>{seller.kontakt_osoba_email}</a>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    
                </div>
            </div>
        </>
	);
};

export default Company;
