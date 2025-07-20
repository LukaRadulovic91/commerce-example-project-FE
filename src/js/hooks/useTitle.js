import { useEffect } from 'react';
import Actions from '@/actions';

export default function (title) {
	useEffect(() => {
		if (title) {
			Actions.setTitle(title);
		}
	}, [title]);
}
