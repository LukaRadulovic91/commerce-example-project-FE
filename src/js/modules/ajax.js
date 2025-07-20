import config from '@/config';
import Actions from '@/actions';
import Persistence from '@/modules/Persistence';

function retry(obj, method, status) {
	if ((status > 0 && status < 500) || status == 501) {
		return false;
	}

	if (!obj._retryAttempt) {
		obj._retryAttempt = 0;
	} else if (!obj.infiniteRetries && obj._retryAttempt >= 2 && status >= 500) {
		Actions.addModal(
			i18n('Greška'),
			i18n("Došlo je do greške na serveru. Molimo Vas pokušajte kasnije ili se obratite podršci.")
		);
		return false;
	}
	obj._retryAttempt++;

	const timeout = obj.retryTimeout
		? obj.retryTimeout
		: Math.min(Math.pow(2, obj._retryAttempt + 5), 2048);
	setTimeout(method === 'POST' ? ajaxPOST.bind(null, obj) : ajaxGET.bind(null, obj), timeout);
	return true;
}

function createAjaxReq(obj, method) {
	const request = new XMLHttpRequest();
	if (!obj.success && !obj.error && !obj.finally) {
		return request;
	}

	request.onreadystatechange = function () {
		if (this.readyState !== 4) {
			return;
		}

		if (obj.handleIf && !obj.handleIf(obj.data)) {
			return;
		}

		const { status, responseText } = this;

		let parsedJSON = null;
		let success = status >= 200 && status <= 299;
		if (responseText.length !== 0) {
			try {
				parsedJSON = JSON.parse(responseText);
			} catch (e) {
				if (!obj.raw) {
					parsedJSON = null;
					success = false;
				}
			}
		}

		if (!success && retry(obj, method, status)) {
			return;
		}

		if (success) {
			if (obj.success) {
				if (obj.raw) {
					obj.success(responseText);
				} else {
					obj.success(parsedJSON);
				}
			}
		} else {
			const errorMessage =
				parsedJSON !== null &&
				typeof parsedJSON === 'object' &&
				'error' in parsedJSON &&
				typeof parsedJSON.error === 'string'
					? parsedJSON.error
					: responseText;
			if (status === 400 && !obj.disableDefaultErrorHandler && errorMessage.length > 0) {
				Actions.addModal('Error', errorMessage);
			}
			if (obj.error) {
				obj.error(status, errorMessage);
			}
		}

		if (obj.finally) {
			obj.finally();
		}
	};
	return request;
}

export function ajaxGET(obj) {
	const request = createAjaxReq(obj, 'GET');

	let { auth, data } = obj;

	const params = [];
	if (data !== undefined) {
		for (const key in data) {
			params.push(key + '=' + encodeURIComponent(data[key]));
		}
	}

	request.open('GET', (obj.api ? config.api_url + obj.api : obj.url) + (params.length > 0 ? ('?' + params.join('&')) : ''), true);
	if (auth) {
		request.setRequestHeader('Authorization', 'Bearer ' + obj.auth.token);
	}
	request.send();
}

export function ajaxPOST(obj) {
	const request = createAjaxReq(obj, 'POST');
	request.open('POST', obj.api ? config.api_url + obj.api : obj.url, true);
	
	let { auth, data } = obj;
	if (auth) {
		request.setRequestHeader('Authorization', 'Bearer ' + obj.auth.token);
	}

	if (!data) {
		request.send();
	} else if (data instanceof FormData) {
		request.send(data);
	} else {
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(data));
	}
}

export function handleError(status, errorMessage) {
	if (status === 401) {
		Actions.cleanupLogin(true);
		window.location = '/login';
	} else if (status === 429){
		Actions.addModal('Greška', errorMessage);
	} else if (status === 466) {
		Actions.showVerifyEmailModal(
			'Molimo Vas potvrdite Vasu Email adresu',
			() => Persistence.set('email_verification_pending', true)
		);
	}
}