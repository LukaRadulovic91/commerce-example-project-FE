import { useCallback, cloneElement, Fragment } from 'react';

import Actions from '@/actions';
import Hooks from '@/hooks';

const Modal = ({ id, title, children, className, custom, customData }) => {
	const i18n = Hooks.useI18n();
	const handleClose = useCallback(() => Actions.closeModal(id), [id]);
	return (
		<div className="modal-holder">
			<span className="modal-helper" />
			<span className="modal-wrapper">
				<div className={'modal' + (className !== null ? ' ' + className : '')}>
					{custom ? (
						cloneElement(children, {
							title: i18n(title),
							handleClose,
							customData,
						})
					) : (
						<Fragment>
							<div className="modal-title">{i18n(title)}</div>
							<div className="modal-content">{children}</div>
							<div className="modal-footer">
								<button className="button" onClick={handleClose}>
									{i18n('OK')}
								</button>
							</div>
						</Fragment>
					)}
				</div>
			</span>
		</div>
	);
};
export default Modal;
