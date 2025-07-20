import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import Routes from './Routes';
import ModalManager from './ModalManager';
import Snackbar from '@ui/Snackbar';
import * as Sentry from "@sentry/react";
import DKFooter from './ui/DKFooter';

import Zendesk from "react-zendesk";
const ZENDESK_KEY = "j0CpGMLD2Wg81fLz1c7AxBPQF2dYhIEjjx1kjLRa";

const setting = {
	color: {
	  theme: "#000"
	},
	launcher: {
	  chatLabel: {
		"en-US": "Need Help"
	  }
	},
	contactForm: {
	  fields: [
		{ id: "description", prefill: { "*": "My pre-filled description" } }
	  ]
	}
  };

const App = ({ store, history }) => (
	<Sentry.ErrorBoundary fallback={"Došlo je do greške"}>
		<Provider store={store}>
			<Router history={history}>
				<div id="content-outer">
					<Routes />
					<Zendesk zendeskKey={ZENDESK_KEY} onLoaded={() => console.log('zendesk load')} />
					<DKFooter />
				</div>
				<ModalManager />
				<Snackbar />
			</Router>
		</Provider>
	</Sentry.ErrorBoundary>
);
export default App;
