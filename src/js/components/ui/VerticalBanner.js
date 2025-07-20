import Hooks from '@/hooks';

const VerticalBanner = ({ banner }) => {
	const i18n = Hooks.useI18n();

	return (
		<div className={'vertical-banner'}>
			<div className="vertical-banner-image">
				<img src={banner.photo?.url} />
			</div>
		</div>
	);
};

export default VerticalBanner;