import { useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';

const dashArray = 1000;
const getConfig = configObj => {
	if (typeof configObj === 'object') {
		return configObj;
	}
	return config[configObj] || config.default;
};

export const CircleLoading = props => {
	const { width = 100, className, thickness = 8, percentStep } = props;

	const [percent, setPercent] = useState(props.percent);
	const [rotation, setRotation] = useState(0);
	const height = width;
	const r = width * 0.45;
	const cx = width / 2;
	const cy = height / 2;

	useEffect(() => {
		const intervalID = setInterval(() => {
			setRotation(rotation + 0.05);
			if (percentStep) {
				setPercent(percent >= 100 ? 20 : percent + percentStep);
			}
		}, 16);
		return () => clearInterval(intervalID);
	}, [rotation, percent, percentStep]);

	const angle = (percent / 100) * 360;
	const l = angle <= 180;
	const a = l ? angle * (Math.PI / 180) : angle * (Math.PI / 180);
	const p1 = {
		x: cx + r * Math.cos(rotation),
		y: cy + r * Math.sin(rotation),
	};
	const p2 = {
		x: cx + r * Math.cos(a + rotation),
		y: cy + r * Math.sin(a + rotation),
	};

	return (
		<svg width={width} height={height} className={'' + className}>
			<circle cx={cx} cy={cy} r={r} fill="#141415" stroke="none" />
			<path
				fill="none"
				className="stroke-primary"
				d={`M ${p1.x} ${p1.y} A ${r} ${r} ${rotation} ${l ? 0 : 1} 1 ${p2.x} ${p2.y}`}
				strokeWidth={thickness}
			/>
		</svg>
	);
};

const CircleProgressBar = ({
	width,
	height = width,
	percent,
	percentFrom,
	animatedPercent,
	className,
	delay,
	config,
	thickness = 8,
}) => {
	const { percent: val } = useSpring({
		percent: percent ?? 0,
		from: { percent: percentFrom ?? 0 },
		config: getConfig(config),
		delay: delay ?? 256,
	});

	return (
		<svg width={width} height={height} className={'circle-progress-bar ' + className}>
			<circle
				className="background"
				cx={width / 2}
				cy={height / 2}
				r={(0.4 * (width + height)) / 2}
				strokeWidth={thickness}
				strokeDasharray={dashArray}
			/>
			<animated.circle
				className="percentage"
				cx={width / 2}
				cy={height / 2}
				r={(0.4 * (width + height)) / 2}
				strokeWidth={thickness}
				strokeDasharray={dashArray}
				strokeDashoffset={(animatedPercent ?? val).interpolate(v =>
					Math.floor(dashArray * (1 - v * width * 0.0025))
				)}
				transform={`rotate(-90, ${width / 2}, ${height / 2})`}
			/>
		</svg>
	);
};

export default CircleProgressBar;
