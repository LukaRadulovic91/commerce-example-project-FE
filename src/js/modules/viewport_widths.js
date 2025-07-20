const devices = {
	// TODO: use values from tailwind config
	mobile: { id: 0, from: 0, to: 768 },
	tablet: { id: 1, from: 769, to: 1023 },
	desktop: { id: 2, from: 1024 },
};

function isDevice(width, deviceInfo) {
	if (width < deviceInfo.from) {
		return false;
	}

	if (deviceInfo.to && width > deviceInfo.to) {
		return false;
	}

	return true;
}

export function getDeviceByWidth(width) {
	for (const i in devices) {
		const device = devices[i];

		if (isDevice(width, device)) {
			return device.id;
		}
	}

	return false;
}

export function isMobile(id) {
	return id === devices.mobile.id;
}

export function isTablet(id) {
	return id === devices.tablet.id;
}

export function isDesktop(id) {
	return id === devices.desktop.id;
}
