import _ from 'lodash';
import { Fragment, useState, useEffect } from 'react';

import { ajaxPOST } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';

import TextField from '@ui/TextField';
import Hooks from '@/hooks';
import Icon from '@ui/Icon';
import Loading from '@ui/Loading';
import UploadImageButton from '@ui/UploadImageButton';
import HorizontalBannerImageOpts from '../../models/HorizontalBannerImageOpts';
import VerticalBannerImageOpts from '../../models/VerticalBannerImageOpts';

const AddBannerModal = ({ title, onSubmit, banner, type, handleClose }) => {
    const i18n = Hooks.useI18n();
    const [bannerToSubmit, setBannerToSubmit] = useState(banner);
    const [imagePreview, setImagePreview] = useState(null);
    const [submittingImage, setSubmittingImage] = useState(false);

    const onSelectImage = imageData => {
		if (submittingImage) {
			return;
        }
        
        setSubmittingImage(true);

		const url = URL.createObjectURL(imageData);
		setImagePreview(url);
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 30000);

        const formData = new FormData();
        formData.append(imageData.name, imageData);

        ajaxPOST({
			api: '/files/save?public=1',
			data: formData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    const logo = response.data.files[0];
                    setBannerToSubmit({...bannerToSubmit, 
                        photo: logo,
                    })
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
			},
            error: (status, errorMessage) => {
				if (status === 401) {
                    Actions.cleanupLogin(true);
                    window.location = '/login';
                }
			},
			finally: () => {
                setSubmittingImage(false);
			},
		});
    };

	return (
		<Fragment>
			<div className="mt-10 mx-12 font-bold text-xl">{i18n(title)}</div>
            <div className="mx-6 my-4">
                <div className="flex flex-col lg:col-span-2 xs:col-span-6">
                    <div className="vtk-seller-field-label">{i18n('Uredjivanje slike')}</div>
                    <UploadImageButton
                        className="w-10 h-10 mr-2 uppercase"
                        onOpenFile={onSelectImage}
                        cropRange={type === 'vertical' ? VerticalBannerImageOpts : HorizontalBannerImageOpts}
                        cropRatio={1}
                        noCrop
                    >
                        {<Icon className="text-black w-full h-full" icon="camera" />}
                    </UploadImageButton>
                    {submittingImage ? (
                        <div className="mt-4 mb-4">
                            <Loading />
                        </div>
                    ) : imagePreview ? (
                        <div className="mt-4 mb-4">
                            <div className="py-4 mb-4">{'Nova slika slajda:'}</div>
                            <div>
                                <img className="mt-4" src={imagePreview} />
                            </div>
                        </div>
                    ) : bannerToSubmit?.photo?.url ? (
                        <div className="text-center md:text-left">
                            <div className="py-4 mb-4">{'Trenutna slika:'}
                                <img className="mt-4" src={bannerToSubmit?.photo?.url} className="inline-block" />
                            </div>
                        </div>
                    ) : null}
                    {/* <div className="text-greyText text-xs mt-1">{i18n('Maksimalna veličina fajla 2mb')}</div> */}
                </div>
                <div className="flex flex-col">
                    <div className="vtk-seller-field-label">{i18n('URL Linka')}</div>
                    <TextField
                        className={'vtk-seller-field-input'}
                        maxLength="200"
                        value={banner?.action_url}
                        onChange={e => setBannerToSubmit({...bannerToSubmit, 
                            action_url: e.target.value,
                        })}
                    />
                </div>
            </div>
            <div className="flex flex-row mt-10 mb-10 mx-12">
                <button className="button signup-button mr-auto" onClick={handleClose}>
                    {i18n('Odustanite')}
                </button>
                <button className="button login-button ml-auto" onClick={() => {
                        onSubmit(bannerToSubmit);
                        handleClose();
                    }}>
                    {i18n('Sačuvajte')}
                </button>
            </div>
		</Fragment>
	);
};
export default AddBannerModal;
