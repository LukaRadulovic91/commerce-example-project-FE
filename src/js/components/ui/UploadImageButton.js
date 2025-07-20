import _ from 'lodash';
import minidash from '@/modules/minidash';
import { useState, useRef } from 'react';

import Hooks from '@/hooks';
import readImageData from '@/modules/readImageData';

import Cropper from 'react-easy-crop';
import Icon from '@ui/Icon';

const createImage = (url, onLoad) => {
	const image = new Image();
	image.addEventListener('load', () => onLoad(image));
	image.addEventListener('error', () => {
		alert('Failed to crop image');
	});
	image.src = url;
};

function getCroppedImg(imageSrc, pixelCrop, fn) {
	createImage(imageSrc, image => {
		const mimeType = imageSrc.substring(imageSrc.indexOf(':') + 1, imageSrc.indexOf(';'));
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		const maxSize = Math.max(image.width, image.height);
		const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

		canvas.width = safeArea;
		canvas.height = safeArea;

		ctx.translate(safeArea / 2, safeArea / 2);
		ctx.translate(-safeArea / 2, -safeArea / 2);

		ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
		const data = ctx.getImageData(0, 0, safeArea, safeArea);

		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		ctx.putImageData(
			data,
			0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
			0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
		);

		canvas.toBlob(fn, mimeType);
	});
}

const ImageCrop = ({ src, cropRatio, className, maxZoomPx, onFinishCrop = {} }) => {
	const i18n = Hooks.useI18n();
	const [crop, setCrop] = useState({
		x: 0,
		y: 0,
	});
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState();
    const shape = 'rect';
	const [loading, setLoading] = useState(false);
	const [minZoom, setMinZoom] = useState(1);
	const [maxZoom, setMaxZoom] = useState(3);
	const [aspect, setAspect] = useState(cropRatio);

	const onMediaLoad = mediaSize => {
		const { naturalWidth: width, naturalHeight: height } = mediaSize;
		const newMinZoom = width > height ? height / width : width / height / aspect;
		const newMaxZoom = (width > height ? height : width) / (maxZoomPx ?? 200);

		if (!cropRatio) {
			setAspect(width / height);
		}

		setMinZoom(newMinZoom);
		setMaxZoom(newMaxZoom);
		if (maxZoom < 1) {
			setZoom(newMaxZoom);
		}
	};

	const onCropComplete = (_, croppedAreaPixels) => {
		setCroppedArea(croppedAreaPixels);
	};

	const onCrop = e => {
		e.preventDefault();
		setLoading(true);
		setTimeout(() => {
			getCroppedImg(src, croppedArea, blob => {
				setLoading(false);
				onFinishCrop(blob);
			});
		}, 512);
	};

	const panelHeight = '50px';
	return (
		<div
			className={minidash.cs(
				'top-0 left-0 bg-transparent w-full h-full fixed z-30 ',
				'flex items-center justify-center',
				className
			)}
		>
			<div className="bg-black-smoke h-full flex flex-col items-center justify-center">
				<div
					disabled={loading}
					style={{ height: panelHeight }}
					className="bg-black-smoke absolute top-0 w-full z-40 items-center justify-between p-4 hidden sm:flex"
				>
					<h1 className="uppercase fond-bold text-lg">
						{croppedArea && croppedArea.width > 0 && croppedArea.height > 0
							? `${Math.floor(croppedArea.width)}x${Math.floor(croppedArea.height)}`
							: '_'}
					</h1>
					<div>
						<button className="button button-primary px-10 mr-4" disabled={loading} onClick={onCrop}>
							{i18n('Potvrdi')}
						</button>
						<button
							className="button button-primary px-10"
							disabled={loading}
							onClick={() => onFinishCrop(null)}
						>
							{i18n('Odustani')}
						</button>
					</div>
				</div>
				<div
					className="cropper-background z-30"
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: '100%',
					}}
				>
					<Cropper
						aspect={aspect}
						cropShape={shape}
						image={src}
						crop={crop}
						zoom={zoom || 1}
						minZoom={minZoom}
						maxZoom={maxZoom}
						zoomSpeed={0.25}
						onCropChange={crop => setCrop(crop)}
						onZoomChange={zoom => setZoom(zoom)}
						restrictPosition={false}
						onCropComplete={onCropComplete}
						onMediaLoaded={onMediaLoad}
					/>
					<div
						className="absolute w-full sm:hidden"
						style={{
							bottom: '15%',
						}}
					>
						<div
							disabled={loading}
							style={{ height: panelHeight }}
							className="relative bg-black-smoke mx-2 flex items-center justify-between p-4"
						>
							<h1 className="uppercase fond-bold text-sm">
								{croppedArea && croppedArea.width > 0 && croppedArea.height > 0
									? `${Math.floor(croppedArea.width)}x${Math.floor(croppedArea.height)}`
									: '_'}
							</h1>
							<button disabled={loading} onClick={() => onFinishCrop(null)} title={i18n('Cancel')}>
								<Icon icon="times" className="bg-black w-12" />
							</button>
							<button disabled={loading} onClick={onCrop} title={i18n('Crop')}>
								<Icon icon="check-square" className="bg-primary w-12" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const UploadImageButton = props => {
	const fileRef = useRef();

	const [imageData, setImageData] = useState(null);

	const onOpenFile = () => {
		const file = fileRef.current.files[0];
		if (!file) {
			return;
		}
		if (props.noCrop) {
			props.onOpenFile(file, ...props);
			return;
		}
		readImageData(file, data => setImageData(data));
	};
	const onFinishCrop = image => {
		const file = new File([image], 'dk_file_upload.png', {type:"image/png", lastModified:new Date().getTime()});
		if (image && props.onOpenFile) {
			props.onOpenFile(file, ...props);
		}
		setImageData(null);
		if (fileRef.current) {
			fileRef.current.value = '';
		}
	};
	const onBrowse = e => {
		e.preventDefault();
		fileRef.current && fileRef.current.click();
    };

	return (
		<>
			{imageData && (
				<ImageCrop
					src={imageData}
					cropRatio={props.cropRatio}
					maxZoomPx={props.maxZoomPx}
					onFinishCrop={onFinishCrop}
				/>
			)}
			<input
				ref={fileRef}
				type="file"
				onChange={onOpenFile}
				className="hidden"
				accept={props.accept || 'image/png, image/jpeg, image/jpg'}
			/>
			<button
				className={minidash.cs(
					'button text-white flex items-center justify-center inline-block leading-snug',
					props.className
				)}
				style={props.style}
				onClick={onBrowse}
			>
				{props.children}
			</button>
		</>
	);
};

export default UploadImageButton;
