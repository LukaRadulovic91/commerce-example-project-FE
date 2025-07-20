import Hooks from '@/hooks';

const HomeSlide = ({ slide }) => {
	const i18n = Hooks.useI18n();

	return (
		<div className={'home-slide'}>
			<a href={(slide.action_url?.includes('http://') || slide.action_url?.includes('https://')) ? slide.action_url : ('https://' + slide.action_url)} rel="noreferrer" target="_blank">
				<div className="home-slide-image">
					<img src={slide.photo?.url} />
				</div>
			</a>
		</div>
	);
};

export default HomeSlide;