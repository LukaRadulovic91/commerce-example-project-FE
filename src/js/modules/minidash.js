const minidash = {
	filter: (obj, fn) => (obj ? obj.filter(fn) : []),
	map: (obj, fn) => {
		let res = [];
		if (!obj) {
			return res;
		}

		if (Array.isArray(obj)) {
			res = obj.map(fn);
		} else if (typeof obj === 'object') {
			for (const key in obj) {
				const value = obj[key];
				res.push(fn(value, key));
			}
		}
		return res;
	},
	forEach: (obj, fn) => {
		if (!obj) {
			return;
		}

		if (Array.isArray(obj)) {
			obj.forEach(fn);
		} else if (typeof obj === 'object') {
			for (const key in obj) {
				const value = obj[key];
				fn(value, key);
			}
		}
	},
	concat: (a, b) => {
		if (!a && !b) {
			return [];
		} else if (!a) {
			return b.concat();
		} else if (!b) {
			return a.concat();
		}
		return a.concat(b);
	},
	padStart: (v, len, pad) => {
		if (String(v).length >= len) {
			return '' + v;
		}
		return (String(pad).repeat(len) + v).slice(-len);
	},
	sumBy: (arr, key) => {
		let v = 0;
		if (arr) {
			for (let i = 0; i < arr.length; i++) {
				v += arr[i][key];
			}
		}
		return v;
	},
	find: (arr, fn) => (arr ? arr.find(fn) : undefined),
	findIndex: (arr, fn) => (arr ? arr.findIndex(fn) : -1),
	slice: (arr, begin, end) => (arr ? arr.slice(begin, end) : []),
	repeat: (n, a) => {
		if (typeof a === 'function') {
			const arr = [];
			for (let i = 0; i < n; i++) {
				arr[i] = a(i);
			}
			return arr;
		}
		return String(a).repeat(n);
	},
	range: (v1, v2, step) => {
		if (step === undefined) {
			step = v1 > v2 ? -1 : 1;
		}

		const arr = [];
		if (step > 0 && v1 <= v2) {
			for (let i = v1; i < v2; i += step) {
				arr.push(i);
			}
		} else if (step < 0 && v1 >= v2) {
			for (let i = v1; i > v2; i += step) {
				arr.push(i);
			}
		}
		return arr;
	},
	take: (arr, n) => (arr ? arr.slice(0, n) : []),
	size: v => {
		if (!v) {
			return 0;
		} else if (Array.isArray(v) || typeof v === 'string') {
			return v.length;
		}
		return Object.keys(v).length;
	},
	isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
	partition: (arr, predicate) => {
		if (!arr) {
			return [];
		}
		const truthy = [];
		const falsey = [];
		for (const x of arr) {
			if (predicate(x)) {
				truthy.push(x);
			} else {
				falsey.push(x);
			}
		}
		return [truthy, falsey];
	},
	times: (n, fn) => {
		fn = fn ?? (i => i);
		if (typeof fn !== 'function') {
			const a = fn;
			fn = () => a;
		}
		const arr = [];
		for (let i = 0; i < n; i++) {
			arr.push(fn(i));
		}
		return arr;
	},

	debounce: (func, wait = 0) => {
		let timerID = null;
		return (...args) => {
			clearTimeout(timerID);
			timerID = setTimeout(() => {
				func(...args);
			}, wait);
		};
	},

	// non-lodash functions
	cs: (...args) => args.filter(x => x).join(' '),
	toString: obj => (obj.toString ? obj.toString() : obj + ''),
	some: (arr, fn) => {
		if (!arr) {
			return false;
		}

		for (const x of arr) {
			if (fn(x)) {
				return true;
			}
		}
		return false;
	},
};
minidash.isEmpty = v => minidash.size(v) == 0;
minidash.contains = (v, fn) => minidash.find(v, fn) != null;
minidash.first = v => {
	if (minidash.size(v) > 0) {
		return v[0];
	}
	return null;
};
minidash.last = v => {
	if (minidash.size(v) > 0) {
		return v[minidash.size(v) - 1];
	}
	return null;
};
minidash.prepend = (obj, x, limit = undefined) => {
	obj = minidash.concat([x], obj);
	const size = minidash.size(obj);
	if (limit !== undefined && size > limit) {
		obj = minidash.slice(obj, 0, size - 1);
	}
	return obj;
};
minidash.append = (obj, x, limit = undefined) => {
	obj = minidash.concat(obj, x);
	if (limit !== undefined && minidash.size(obj) > limit) {
		obj = minidash.slice(obj, 1);
	}
	return obj;
};
minidash.arrayToMap = obj => {
	const result = {};
	minidash.forEach(obj, (x, i) => {
		result[x] = i;
	});
	return result;
};

export default minidash;
