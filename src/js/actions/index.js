import config from '@/config';

import Store from '@/modules/Store';
import ReduxState from '@/modules/ReduxState';

import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ChoiceDialog from '@/components/modals/ChoiceDialog';
import NACEModal from '../components/modals/NACEModal';
import HSModal from '../components/modals/HSModal';
import AddSlideModal from '../components/modals/AddSlideModal';
import AddBannerModal from '../components/modals/AddBannerModal';
import VerifyEmailModal from '../components/modals/VerifyEmailModal';

const Actions = {
	setUser: user => Store.dispatch({ type: 'SET_USER', user }),
	setUserRole: userRole => Store.dispatch({ type: 'SET_USER_ROLE', userRole }),

	setAuthenticating: authenticating => Store.dispatch({ type: 'SET_AUTHENTICATING', authenticating }),

	setLanguage: language => Store.dispatch({ type: 'SET_LANGUAGE', language }),

	cleanupLogin: cleanup => Store.dispatch({ type: 'CLEANUP_LOGIN', cleanup }),

	addModal: (
		title,
		content,
		className = null,
		custom = false,
		canCloseWithEsc = undefined,
		id = undefined,
		onClose = undefined
	) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				id,
				title,
				content: typeof content === 'string' ? ReduxState.get().i18n(content) : content,
				className,
				custom,
				canCloseWithEsc: canCloseWithEsc !== undefined ? canCloseWithEsc : typeof content === 'string',
				onClose,
			},
		}),

	// alias for addModal 
	alert: (title, content, options = {}) =>
		Actions.addModal(
			title,
			content,
			options.className,
			options.custom,
			options.canCloseWithEsc,
			options.id,
			options.onClose
		),

	closeModal: id => Store.dispatch({ type: 'CLOSE_MODAL', id }),
	confirm: (title, content, handler) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <ConfirmDialog content={content} onSubmit={handler} />,
				className: null,
				custom: true,
				canCloseWithEsc: true,
			},
		}),
	choice: (title, content, choices, handler) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <ChoiceDialog content={content} choices={choices} onSubmit={handler} />,
				className: null,
				custom: true,
			},
		}),
	showNACEModal: (title, NACEKlasifikacije, selectedKlasifikacije, handler, selectAny ) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <NACEModal onSubmit={handler} NACEKlasifikacije={NACEKlasifikacije} selectedNaceClassifications={selectedKlasifikacije} selectAny={selectAny}/>,
				className: 'nace-modal w-full lg:w-4/5 ',
				custom: true,
			},
		}),
	showHSModal: (title, HSKlasifikacije, selectedKlasifikacije, handler, selectAny) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <HSModal onSubmit={handler} HSKlasifikacije={HSKlasifikacije} selectedHSClassifications={selectedKlasifikacije} selectAny={selectAny} />,
				className: 'hs-modal w-full lg:w-4/5 ',
				custom: true,
			},
		}),
	showAddSlideModal: (title, slide, handler) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <AddSlideModal onSubmit={handler} slide={slide} />,
				className: 'add-slide-modal',
				custom: true,
			},
		}),
	showAddBannerModal: (title, banner, type, handler) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <AddBannerModal onSubmit={handler} banner={banner} type={type} />,
				className: 'add-slide-modal',
				custom: true,
			},
		}),
	showVerifyEmailModal: (title, handler) =>
		Store.dispatch({
			type: 'ADD_MODAL',
			modal: {
				title,
				content: <VerifyEmailModal onSubmit={handler} />,
				className: null,
				custom: true,
			},
		}),

	addSnack: (title, content, opts) =>
		Store.dispatch({
			type: 'ADD_SNACK',
			snack: { title, content, opts },
		}),
	closeSnack: id => Store.dispatch({ type: 'CLOSE_SNACK', id }),

	// Non-Redux actions
	setTitle: title => {
		if (!title) {
			document.title = config.project_name;
		} else {
			document.title = title + ' - ' + config.project_name;
		}
	},
	setMetaDescription: description => {
		document.querySelector('meta[name=description]').content = description;
	},

	setViewportDevice: viewportDevice =>
		Store.dispatch({ type: 'SET_VIEWPORT_DEVICE', viewportDevice }),
};

export default Actions;