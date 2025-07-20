import { forwardRef } from 'react';

let toggleCheckboxCounter = 1;

const ToggleCheckbox = forwardRef((props, ref) => {
	let id = props.id;
	if (props.label && !id) {
		id = '_toggleCheckbox' + toggleCheckboxCounter++;
	}

	return (
		<div className="toggle-checkbox-container">
			<div className={'toggle-checkbox ' + props.className}>
				<input
					className="toggle-checkbox"
					id={id}
					type="checkbox"
					onChange={props.onChange}
					defaultChecked={props.defaultChecked}
					disabled={props.disabled}
					checked={props.checked}
					ref={ref}
				/>{' '}
				<label className="toggle-checkbox" htmlFor={id} />
			</div>
			<label htmlFor={id}>{props.label}</label>
		</div>
	);
});
export default ToggleCheckbox;
