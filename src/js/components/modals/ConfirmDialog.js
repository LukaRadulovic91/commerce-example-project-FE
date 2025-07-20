import { Fragment } from 'react';

import Hooks from '@/hooks';

const ConfirmDialog = ({ title, content, onSubmit, handleClose }) => {
	const i18n = Hooks.useI18n();
	return (
		<Fragment>
			<div className="modal-title">{i18n(title)}</div>
			<div className="modal-content">{content}</div>
			<div className="modal-footer">
				<button className="button button-negative mr-1" onClick={handleClose}>
					{i18n('Ne')}
				</button>
				<button
					className="button button-positive ml-1"
					onClick={() => {
						onSubmit();
						handleClose();
					}}
				>
					{i18n('Da')}
				</button>
			</div>
		</Fragment>
	);
};
export default ConfirmDialog;
