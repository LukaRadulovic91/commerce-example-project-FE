import Hooks from '@/hooks';
import { Link } from 'react-router-dom';

const PartnerLogoSlide = ({ slide }) => {
	const i18n = Hooks.useI18n();
    const url = "/company/" + slide?.seller?.id;

	return (
		<Link to={url} className={'transition duration-150 ease-in-out hover:bg-black-smoke cursor-pointer partner-logo-slide'}>
			<div className={'partner-logo-slide-image'}>
				<img alt={i18n('Nas partner')} src={slide?.seller?.photo_logo?.url} />
			</div>
		</Link>
	);
};

export default PartnerLogoSlide;