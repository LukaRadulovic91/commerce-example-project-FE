import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ReactDOM from 'react-dom';

import History from '@/modules/History';
import Store from '@/modules/Store';

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import App from '@/components/App';

// CSS
import './css/main.css';

// Sentry.init({
// 	dsn: "https://a68d9b62fa19402c818e8c766e8871b5@o569982.ingest.sentry.io/5716385",
// 	integrations: [new Integrations.BrowserTracing()],

// 	// Set tracesSampleRate to 1.0 to capture 100%
// 	// of transactions for performance monitoring.
// 	// We recommend adjusting this value in production
// 	tracesSampleRate: 0.1,
// });

History.listen(location => {
	const { ga } = window;
	if (typeof ga !== 'undefined') {
		ga('set', 'page', location.pathname);
		ga('send', 'pageview');
	}

	const contentWrapper = document.getElementById('content-wrapper');
	if (contentWrapper !== null) {
		contentWrapper.scrollTop = 0;
		contentWrapper.scrollLeft = 0;
	}
	window.scrollTo(0, 0);
});

ReactDOM.render(<App store={Store} history={History} />, document.getElementById('main'));
