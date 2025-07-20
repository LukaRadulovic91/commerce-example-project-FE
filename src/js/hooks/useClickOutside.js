import { useEffect } from 'react';

export default (node, enabled, onBlur) => {
	useEffect(() => {
		if (node == null) {
			return () => null;
		}
		const onClick = e => {
			if (!enabled) {
				return;
			}
			let target = e.target;
			while (target !== null) {
				if (target === node) {
					return;
				}
				target = target.parentNode;
			}
			onBlur(e.target);
		};
		window.addEventListener('mousedown', onClick);
		return () => window.removeEventListener('mousedown', onClick);
	}, [node, enabled, onBlur]);
};
