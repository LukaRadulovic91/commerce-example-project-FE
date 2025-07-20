import Hooks from '@/hooks';

const AdminHomeSlide = ({ slide }) => {
	const i18n = Hooks.useI18n();

	return (
		<div className={'admin-home-slide'}>
			<div className="admin-home-slide-image">
				<img src={slide.photo?.url} />
			</div>
		</div>
	);
};

export default AdminHomeSlide;