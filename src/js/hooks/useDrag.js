import { useState } from 'react';

export default (node, horizontalScroll, verticalScroll) => {
	const [dragging, setDragging] = useState(false);
	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
	const [scroll, setScroll] = useState({ x: 0, y: 0 });

	const onMouseDown = e => {
		if (!node) {
			return;
		}

		node.style.cursor = 'move';

		setDragging(true);
		setScroll({ x: node.scrollLeft, y: node.scrollTop });
		const event = e.touches?.[0] ?? e;
		setMousePos({ x: event.clientX, y: event.clientY });
	};

	const onMouseMove = e => {
		if (!node || !dragging) {
			return;
		}

		const event = e.touches?.[0] ?? e;
		const x = event.clientX;
		const y = event.clientY;

		if (horizontalScroll) {
			node.scrollLeft = scroll.x - (x - mousePos.x);
		}

		if (verticalScroll) {
			node.scrollTop = scroll.y - (y - mousePos.y);
		}
	};

	const onMouseUp = () => {
		node.style.cursor = '';
		setDragging(false);
	};

	return [onMouseDown, onMouseMove, onMouseUp];
};
