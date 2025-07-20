import { Fragment } from 'react';

import Hooks from '@/hooks';

const ChoiceDialog = ({ title, content, choices, onSubmit, handleClose }) => {
	const i18n = Hooks.useI18n();
	return (
		<Fragment>
			<div className="modal-title">{i18n(title)}</div>
			<div className="modal-content">{content}</div>
			<div className="modal-footer space-x-1">
				{choices.map((c, i) => (
					<button
						key={c}
						className="button"
						onClick={() => {
							onSubmit(i);
							handleClose();
						}}
					>
						{i18n(c)}
					</button>
				))}
			</div>
		</Fragment>
	);
};
export default ChoiceDialog;
