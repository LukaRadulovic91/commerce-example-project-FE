import Hooks from '@/hooks';
import { Link } from 'react-router-dom';

const ProductSlide = ({ slide, featured, sellerId, productMode, trending }) => {
	const i18n = Hooks.useI18n();
	const proizvod = productMode ? slide : slide.proizvod;
	const url = sellerId ? '/product/' + proizvod?.id : '/product/' + proizvod?.id;

	return (
		<Link to={url} className={'transition duration-150 ease-in-out hover:bg-black-smoke cursor-pointer ' + (featured ? ' featured' : '') + (trending ? ' home-trending-product-slide' : ' home-product-slide')}>
			<div className={(featured ? ' featured' : '')  + (trending ? ' home-trending-product-slide-image' : ' home-product-slide-image')}>
				<img src={proizvod?.photo_1?.url} />
			</div>
		</Link>
	);
};

export default ProductSlide;