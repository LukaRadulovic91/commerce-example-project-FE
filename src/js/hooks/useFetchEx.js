import _ from 'lodash';
import { useRef, useEffect, useState } from 'react';

import { ajaxGET } from '@/modules/ajax';

function useDeepCompareEffect(effect, deps) {
	const ref = useRef(undefined);
	if (!_.isEqual(deps, ref.current)) {
		ref.current = deps;
	}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(effect, ref.current);
}

export default function (url, opts) {
	if (typeof opts?.data === 'object') {
		for (const k in opts.data) {
			if (opts.data[k] === undefined) {
				delete opts.data[k];
			}
		}
	}

	const [response, setResponse] = useState(url ? false : null);
	const seq = useRef(0);
	useDeepCompareEffect(
		() => {
			const ajaxSeq = seq.current + 1;
			seq.current = ajaxSeq;

			if (!url) {
				if (response !== null) {
					setResponse(null);
				}
				return undefined;
			}

			if (response !== false) {
				setResponse(false);
			}

			ajaxGET({
				api: url,
				...opts,
				handleIf: () => ajaxSeq === seq.current,
				success: response => setResponse(opts?.success ? opts.success(response) : response),
				error: (status, errorMessage) => {
					setResponse(null);
					if (opts?.error) {
						opts.error(status, errorMessage);
					}
				},
			});

			return () => {
				seq.current = 0;
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[url, opts?.data, !!opts?.auth]
	);
	return [response, setResponse];
}
