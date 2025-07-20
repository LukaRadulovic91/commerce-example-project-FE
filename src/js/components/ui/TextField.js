import { forwardRef, Fragment } from 'react';
import Icon from '@ui/Icon';
import ImageIcon from '@ui/ImageIcon';

let textFieldCounter = 1;

const TextField = forwardRef((props, ref) => {
	let id = props.id;
	if (props.label && !id) {
		id = '_textField' + textFieldCounter++;
	}

	return (
		<>
			{props.label && (
				<Fragment>
					<label htmlFor={id}>
						{props.label}
						{':'}
					</label>
					<br />
				</Fragment>
			)}
			<div
				className={(props.className ? props.className : 'textfield')}
				style={props.style}
			>
				<input
					id={id}
					type={props.type || 'text'}
					onChange={props.onChange}
					onClick={props.onClick}
					onKeyDown={props.onKeyDown}
					defaultValue={props.defaultValue}
					value={props.value ?? undefined}
					maxLength={props.maxLength}
					min={props.min}
					max={props.max}
					placeholder={props.placeholder}
					required={props.required}
					className={'w-full ' + (props.readOnly ? 'disabled ' : '') + (props.inputClassName ?? '')}
					autoComplete={props.autoComplete ?? 'off'}
					ref={ref}
					focus={props.focus}
					onBlur={props.onBlur}
					list={props.list}
					disabled={props.disabled}
					readOnly={props.readOnly}
					style={props.inputStyle}
				/>
			</div>
		</>
	);
});

export const IconTextField = forwardRef((props, ref) => {
	const label = props.label || props.placeholder;
	let id = props.id;
	if (label && !id) {
		id = '_tf' + textFieldCounter++;
	}

	return (
		<div className={'icon-textfield ' + props.className} style={props.style}>
			{(props.img || props.icon) && (
				<label htmlFor={id}>
					{props.img ? <ImageIcon src={props.img} className="w-5 h-5" /> : <Icon icon={props.icon} />}
				</label>
			)}
			<input
				id={id}
				type={props.type || 'text'}
				onChange={props.onChange}
				onClick={props.onClick}
				defaultValue={props.defaultValue}
				maxLength={props.maxLength}
				placeholder={label}
				required={props.required}
				className={'w-full ' + props.inputClassName}
				autoComplete={props.autoComplete ?? 'off'}
				focus={props.focus}
				onBlur={props.onBlur}
				ref={ref}
			/>
		</div>
	);
});

export default TextField;
