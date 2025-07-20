import useFetchEx from './useFetchEx';

export default function (url, opts) {
	const [response] = useFetchEx(url, opts);
	return response;
}
