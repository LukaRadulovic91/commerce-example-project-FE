import useFetchEx from './useFetchEx';
import { useState, useEffect } from 'react';

const maxCount = 256;

export default function (url, millis, opts) {
	const [counter, setCounter] = useState(0);
	const [response] = useFetchEx(url, {
		...opts,
		data: {
			...(opts.data || {}),
			_poll: counter,
		},
	});

	useEffect(() => {
		const timerID = setTimeout(() => setCounter((counter + 1) % maxCount), millis);
		return () => {
			clearTimeout(timerID);
		};
	}, [counter, setCounter, millis]);

	return response;
}
