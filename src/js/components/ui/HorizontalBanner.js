import Hooks from '@/hooks';

const HorizontalBanner = ({ banner }) => {
	const i18n = Hooks.useI18n();

	return (
		<div className={'horizontal-banner'}>
			<div className="horizontal-banner-image">
				<img src={banner.photo?.url} />
			</div>
		</div>
	);
};

export default HorizontalBanner;