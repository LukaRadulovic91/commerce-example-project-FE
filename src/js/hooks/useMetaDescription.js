import { useEffect } from 'react';
import Actions from '@/actions';

export default function (description) {
	useEffect(() => {
		Actions.setMetaDescription(description);
	}, [description]);
}
