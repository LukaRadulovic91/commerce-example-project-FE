import { useState, useEffect } from 'react';
import minidash from '@/modules/minidash';

import Icon from '@ui/Icon';

const Loading = ({ size, className, inline }) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => setVisible(true), 500);
		return () => clearTimeout(timeout);
	}, []);

	if (!visible) {
		return null;
	}

	return (
		<div
			className={minidash.cs(
				'text-center text-primary overflow-hidden',
				inline ? 'inline-block' : 'py-10',
				className
			)}
		>
			<Icon icon="circle-notch" size={size || '3x'} spin />
		</div>
	);
};
export default Loading;
