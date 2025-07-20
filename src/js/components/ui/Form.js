import { forwardRef } from 'react';

const Form = forwardRef(({ id, className, onSubmit, disabled, children }, ref) => (
	<form ref={ref} id={id} className={className} onSubmit={onSubmit}>
		<fieldset disabled={disabled}>{children}</fieldset>
	</form>
));
export default Form;
