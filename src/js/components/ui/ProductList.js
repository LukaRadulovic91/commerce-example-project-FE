import _ from 'lodash';

import Hooks from '@/hooks';
import Loading from '@ui/Loading';
import Icon from '@ui/Icon';
import { Link } from 'react-router-dom';

const ProductList = ({
	products,
    sellerId
}) => {
	const i18n = Hooks.useI18n();

	if (products === false) {
		return <Loading />;
	}
    
	return (
        <div className="product-results-list">
            {_.map(products, (product, index) => (
                <Link to={'/product/' + product.id} className={'flex flex-col w-full md:flex-row product-results-list-item mx-2 my-5'} key={product.id} index={index}>
                    {/* TODO Fix logo size to ensure uniform list appearance */}
                    {product.photo_1?.url ? <img className="product-results-list-image ml-auto w-1/5 mr-auto md:ml-0 md:mr-0" src={product.photo_1?.url}/> : <i className="fas fa-camera product-results-list-image-placeholder fa-4x"></i>}
                    <div className="block md:hidden divider" />
                    <div className="flex flex-col sm:flex-row w-4/5">
                        <div className="p-4 mt-auto mb-auto h-full flex flex-col text-lg w-full sm:w-2/3 truncate max-h-product-list-item product-details">
                            <div className={'font-bold truncate product-list-naziv'}>
                                {product.naziv}
                            </div>
                            <div className={''}>
                                {product.carinska_tarifa?.hs?.id}
                            </div>
                            <div className={'mt-auto'}>
                                {product.seller?.naziv}
                            </div>
                            <div className={''}>
                                {product.seller?.mjesto?.postanski_broj}{' '}{product.seller?.mjesto?.naziv}{', '}{product.seller?.mjesto?.opstina?.naziv}
                            </div>
                        </div>
                        <div className="flex flex-row w-full sm:w-1/3 md:w-1/3 product-description">
                            <div className="p-4 mt-auto mb-auto h-full flex flex-col text-lg  w-full product-results-list-details">
                                <div className={'company-list-description'}>
                                    <span className={'font-bold'}>{i18n('Opis:')}</span>{' '}<span>{product.opis}</span>
                                </div>
                                <div className={'mt-auto'}>
                                    {i18n('Proizvodni kapacitet:')}{' '}{product.carinska_tarifa?.godisnja_kolicina}
                                </div>
                                <div className={''}>
                                    {i18n('White Label:')}{' '}{product.seller?.white_label ? i18n('Da') : i18n('Ne')}
                                </div>
                            </div>
                            <div className="product-results-list-details-button secondary-action-color">
                                <Icon icon="angle-right" size={'2x'} className="text-white" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
	);
};

export default ProductList;
