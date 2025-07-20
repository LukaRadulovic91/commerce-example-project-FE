export default (file, fn) => {
	const reader = new FileReader();
	reader.onload = e => {
		fn(e.target.result);
	};
	reader.readAsDataURL(file);
};
