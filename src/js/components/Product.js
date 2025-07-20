import _ from 'lodash';

import Hooks from '@/hooks';

import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import DKTopBar from './ui/DKTopBar';
import Header from './ui/Header';
import Loading from '@ui/Loading';
import Breadcrumbs from '@ui/Breadcrumbs';
import LoadingBar from 'react-top-loading-bar';

import { Link } from 'react-router-dom';

const Product = () => {
	const i18n = Hooks.useI18n();
	const history = useHistory();
    const [progress, setProgress] = useState(0);
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [showImage, setShowImage] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [otherProducts, setOtherProducts] = useState([]);
	Hooks.useTitle(i18n('Digitalna Komora'));

    useEffect(() => {
        setProgress(30);
        ajaxGET({
            api: '/proizvodi/' + id,
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let product = response.data;
                    setProduct(product);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage);
                history.push('/');
			},
            finally: () => {
                setProgress(100);
            },
            infiniteRetries: false,
        });
	}, [id]);

    useEffect(() => {
        if (product && product.seller) {
            setProgress(75);
            ajaxGET({
                api: '/sellers/' + product.seller?.id + '/proizvodi?per_page=5&page=1',
                auth: {
                    token: Persistence.get('user_token'),
                },
                success: response => {
                    if (response.success && response.message === "OK") {
                        let products = response.data;
                        let filteredProducts = _.filter(products, p => p.id !== product.id);
                        setOtherProducts(filteredProducts);
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
                api: '/profile/sellers/' + product.seller.id,
                auth: {
                    token: Persistence.get('user_token'),
                },
                success: response => {
                    if (response.success && response.message == "OK") {
                        let seller = response.data;
                        setSeller(seller);
                    } else {
                    }  
                },
                finally: () => {
                    setProgress(100);
                },
                error: (status, errorMessage) => {
                    handleError(status, errorMessage)
                },
                infiniteRetries: false,
            });
        }
	}, [product, id]);

    const showImageOverlay = (image) => {
        setCurrentImage(image);
        setShowImage(true);
    }


    const onSearch = (searchType, searchTerm) => {
        if (searchType === 'product') {
            history.push(`/product_search/${searchTerm}`);
        } else if (searchType === 'seller') {
            history.push(`/seller_search/${searchTerm}`);
        }
    }

    if (!product) {
        return (
            <>
                <DKTopBar />
                <Header onSearch={onSearch}/>
                <Loading />
            </>
        )
    }

	return (
        <>
            {(showImage && currentImage) && (
				<div onClick={() => setShowImage(!showImage)} className="fixed w-full h-full pin z-50 overflow-auto bg-black-semitransparent flex">
					<div className="ml-auto mr-auto mt-auto mb-auto">
                    <img alt={i18n('Slika proizvoda')} className="product-detail-view-image-main" src={currentImage.url}/>
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
                    <div className="flex flex-col lg:flex-row bg-lightGray pb-10 lg:pb-0 product-details-header">
                    {product.photo_1?.url ? <img  alt={i18n('Slika proizvoda')} className="product-view-image" src={product.photo_1?.url}/> : <i className="fas fa-camera product-view-image-placeholder fa-4x"></i>}
                        <div className="flex flex-col sm:flex-row w-full">
                            <div className="pl-6 lg:p-4 mt-auto mb-auto h-full flex flex-col text-lg w-4/5">
                                <div className={'font-bold text-4xl h-full flex items-center'}>
                                    {product.naziv}
                                </div>
                            </div>
                            <div className="pl-6 lg:p-4 h-full flex items-center text-lg pr-20">
                                {seller && <div>
                                    <Link to={'/company/' + seller.id} target="_blank" rel="noopener noreferrer" className={'font-bold cursor-pointer'}>
                                        {seller.naziv}<i className="fas fa-external-link-alt pl-2"></i>
                                    </Link>
                                    <div className={''}>
                                        {seller.adresa}
                                    </div>
                                    <div className={''}>
                                        {seller.mjesto?.postanski_broj}{' '}{seller.mjesto?.naziv}{seller.mjesto?.naziv ? ', ' : ''}{seller.mjesto?.opstina?.naziv}
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="bg-actionYellow text-black flex flex-col lg:flex-row font-semibold text-xl details-view-section-header px-6">
                        {seller && (
                            <>
                                <div className="details-view-section-header w-full lg:w-1/3">
                                    <a href={(seller.website?.includes('http://') || seller.website?.includes('https://')) ? seller.website : ('https://' + seller.website)} rel="noreferrer" target="_blank">{seller.website}</a>
                                </div>
                                <div className="details-view-section-header w-full lg:w-1/3 lg:text-center">
                                    <a href={'mailto:' + seller.email}>{seller.email}</a>
                                </div>
                                <div className="details-view-section-header w-full lg:w-1/3 lg:text-right">
                                    <a href={'tel:' + seller.telefon}>{seller.telefon}</a>
                                </div>
                            </>
                        )}
                    </div>

                    {(product.photo_1 || product.photo_2 || product.photo_3 || product.photo_4) &&
                        <div className="bg-lightGray pt-4">
                            {product.photo_1 ? <img onClick={() => showImageOverlay(product.photo_1)} alt={i18n('Slika proizvoda')} className="product-detail-view-image-main cursor-pointer" src={product.photo_1?.url}/> : null} 
                            <div className="flex flex-row whitespace-nowrap overflow-x-auto lg:justify-around mt-2 pb-4">
                                {product.photo_1 ? <div className="w-1/4 mx-4 flex items-center justify-center"><img onClick={() => showImageOverlay(product.photo_1)}  alt={i18n('Slika proizvoda')} className="product-detail-view-image cursor-pointer" src={product.photo_1?.url}/></div> : <div className="w-1/4 mx-4 flex items-center justify-center"><i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i></div>}
                                {product.photo_2 ? <div className="w-1/4 mx-4 flex items-center justify-center"><img onClick={() => showImageOverlay(product.photo_2)}  alt={i18n('Slika proizvoda')} className="product-detail-view-image cursor-pointer" src={product.photo_2?.url}/></div> : <div className="w-1/4 mx-4 flex items-center justify-center"><i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i></div>}
                                {product.photo_3 ? <div className="w-1/4 mx-4 flex items-center justify-center"><img onClick={() => showImageOverlay(product.photo_3)}  alt={i18n('Slika proizvoda')} className="product-detail-view-image cursor-pointer" src={product.photo_3?.url}/></div> : <div className="w-1/4 mx-4 flex items-center justify-center"><i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i></div>}
                                {product.photo_4 ? <div className="w-1/4 mx-4 flex items-center justify-center"><img onClick={() => showImageOverlay(product.photo_4)}  alt={i18n('Slika proizvoda')} className="product-detail-view-image cursor-pointer" src={product.photo_4?.url}/></div> : <div className="w-1/4 mx-4 flex items-center justify-center"><i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i></div>}
                            </div>
                        </div>
                    }


                    <div className="flex flex-col lg:flex-row text-lg py-1 mt-4 mb-4">
                        <div className="w-full lg:w-1/2 px-2 py-2">
                            <div className="flex flex-row py-2 lg:justify-center lg:items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x yellow-circle-icon"></i>
                                    <i className="fas fa-tag fa-stack-1x text-black"></i>
                                </span>
                                <span className="flex flex-col pl-2">
                                    <div>{i18n('Carinska tarifa (HS)')}</div>
                                    <div className="font-bold">{product.carinska_tarifa?.hs?.id}</div>
                                </span>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 px-2 py-2">
                            <div className="flex flex-row py-2 lg:justify-center lg:items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x yellow-circle-icon"></i>
                                    <i className="fas fa-barcode fa-stack-1x text-black"></i>
                                </span>
                                <span className="flex flex-col pl-2">
                                    <div>{i18n('Bar kod')}</div>
                                    <div className="font-bold">{product.barkod}</div>
                                </span>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 px-2 py-2 ml-0 lg:ml-auto">
                            <div className="flex flex-row py-2 lg:justify-center lg:items-center">
                                <span className="fa-stack fa-2x">
                                    <i className="fas fa-circle fa-stack-2x yellow-circle-icon"></i>
                                    <i className="fas fa-boxes fa-stack-1x text-black"></i>
                                </span>
                                <span className="flex flex-col pl-2 product-detail-kolicina">
                                    <div>{i18n('Godišnja količina')}</div>
                                    <div className="font-bold">{product.carinska_tarifa?.godisnja_kolicina}</div>
                                </span>
                            </div>
                        </div>
                    </div>

                    {product.opis && (
                        <>
                            <div className="detail-view-section-header-yellow bg-actionDarkYellow text-black">
                                {i18n('Opis proizvoda')}
                            </div>
                            <div className="flex flex-row text-lg py-6">
                                {product.opis}
                            </div>
                        </>
                    )}

                    {(otherProducts && otherProducts?.length > 0) && (
                        <>
                            <div className="detail-view-section-header-yellow bg-actionDarkYellow text-black mb-6">
                                {i18n('Ostali proizvodi ove kompanije')}
                            </div>
                            <div className="mb-10 flex flex-row whitespace-nowrap overflow-x-auto">
                                {_.map(otherProducts, (otherProduct, index) => (
                                    <Link to={'/product/' + otherProduct.id} className={'flex flex-col mx-5 my-2'} key={otherProduct.id} index={index}>
                                        {product.photo_1 ? <img alt={i18n('Slika proizvoda')} className="product-results-list-image" src={otherProduct.photo_1?.url}/> : <i className="fas fa-camera product-results-list-image-placeholder placeholder-border fa-4x"></i>}
                                        <div className="product-name text-center mt-5 text-lg">
                                            {otherProduct.naziv}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
	);
};

export default Product;
