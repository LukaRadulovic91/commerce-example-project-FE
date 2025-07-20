import _ from 'lodash';
import { useState, useEffect } from 'react';

import Actions from '@/actions';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { useHistory } from 'react-router-dom';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import Icon from '@ui/Icon';
import DKTopBar from '@ui/DKTopBar';
import Header from './ui/Header';
import Loading from '@ui/Loading';
import UploadImageButton from '@ui/UploadImageButton';
import BuyerAvatarImageOpts from '../models/BuyerAvatarImageOpts';

const BuyerProfile = props => {
	const i18n = Hooks.useI18n();
    const history = useHistory();
	const userData = Hooks.useUser();
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [submittingImage, setSubmittingImage] = useState(false);
    const [buyerInfo, setBuyerInfo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const onQuit = e => {
		e.stopPropagation();
        Actions.confirm(
			i18n('Da li Ste sigurni?'),
			i18n('Izmjene neće biti sačuvane.'),
            () => history.push('/')
		);
    }

    const onSelectImage = imageData => {
		if (submitting) {
			return;
        }
        
		setSubmitting(true);
        setSubmittingImage(true);

		const url = URL.createObjectURL(imageData);
		setImagePreview(url);
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 30000);

        const formData = new FormData();
        formData.append(imageData.name, imageData);

        ajaxPOST({
			api: '/files/save',
			data: formData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message === "OK") {
                    const img = response.data.files[0];
                    setBuyerInfo({...buyerInfo, 
                        photo: img,
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
				setSubmitting(false);
                setSubmittingImage(false);
			},
		});
    };
    
    useEffect(() => {
        setSubmittingImage(true);
        ajaxGET({
            api: '/profile/buyers/' + userData.id,
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message === "OK") {
                    let basicInfo = response.data;
                    setBuyerInfo(basicInfo);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
            finally: () => {
                setSubmittingImage(false);
                setFetching(false);
            },
            infiniteRetries: false,
        });
	}, []);

	const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
        }
        
        let buyerData = buyerInfo;

        if (buyerData.photo) {
            delete buyerData.photo.name;
            delete buyerData.id;
            delete buyerData.email;
            delete buyerData.photo_logo?.id;
        }
        
		setSubmitting(true);
		ajaxPOST({
			api: '/profile/buyers/' + userData.id,
			data: buyerData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message === "OK") {
                    Actions.addModal('Ažuriranje uspješno!', '');
                    Actions.setUser(response.data);
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
				setSubmitting(false);
			},
		});
    };

    useEffect(() => {
        var elements = document.getElementsByTagName("INPUT");

        for (var i = 0; i < elements.length; i++) {
            elements[i].oninvalid = function(e) {
                e.target.setCustomValidity("");
                if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity("Polje ne smije biti prazno");
                } else if(e.target.validity.tooLong) {
                    e.target.setCustomValidity("Predugačak unos");
                } else if(e.target.validity.tooShort) {
                    e.target.setCustomValidity("Prekratak unos");
                } else if(e.target.validity.typeMismatch) {
                    e.target.setCustomValidity("Pogrešan tip unosa");
                } else if (!e.target.validity.valid) {
                    e.target.setCustomValidity("Molimo provjerite unos");
                }
            };
            elements[i].oninput = function(e) {
                e.target.setCustomValidity("");
            };
        }

        var textareas = document.getElementsByTagName("textarea");
        for (var i = 0; i < textareas.length; i++) {
            textareas[i].oninvalid = function(e) {
                e.target.setCustomValidity("");
                if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity("Polje ne smije biti prazno");
                } else if(e.target.validity.tooLong) {
                    e.target.setCustomValidity("Predugačak unos");
                } else if(e.target.validity.tooShort) {
                    e.target.setCustomValidity("Prekratak unos");
                } else if(e.target.validity.typeMismatch) {
                    e.target.setCustomValidity("Pogrešan tip unosa");
                } else if (!e.target.validity.valid) {
                    e.target.setCustomValidity("Molimo provjerite unos");
                }
            };
            textareas[i].oninput = function(e) {
                e.target.setCustomValidity("");
            };
        }

    })

   const onSearch = (searchType, searchTerm) => {
        if (searchType === 'seller') {
            history.push(`/seller_search/${searchTerm}`);
        } else if (searchType === 'product') {
            history.push(`/product_search/${searchTerm}`);
        }
    }
    
	return (
        <>
            <DKTopBar />
            <Header onSearch={onSearch} />
            <div className="ml-auto mr-auto mb-8 buyer-profile-container">
                <Form
                    onSubmit={handleSubmit}
                    disabled={submitting}
                    className={'form-vertical vtk-form mx-5'}
                >
                    {fetching ? (
                        <Loading />
                    ) : (
                        <>
                            <div className="vtk-seller-section-header">
                                {i18n('Uredite vaš profil')}
                            </div>
                            <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                                <div className="flex flex-col lg:col-span-5 xs:col-span-10">
                                    <div className="vtk-seller-field-label">{i18n('Ime i prezime*')}</div>
                                    <TextField
                                        className={'vtk-seller-field-input required'}
                                        maxLength="254"
                                        required
                                        value={buyerInfo?.ime_i_prezime}
                                        onChange={e => setBuyerInfo({...buyerInfo, 
                                            ime_i_prezime: e.target.value,
                                        })}
                                    />
                                </div>
                                <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                    <div className="vtk-seller-field-label">{i18n('Telefon')}</div>
                                    <TextField
                                        className={'vtk-seller-field-input required'}
                                        maxLength="254"
                                        required
                                        value={buyerInfo?.telefon}
                                        onChange={e => setBuyerInfo({...buyerInfo, 
                                            telefon: e.target.value,
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Web sajt')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="1000"
                                    value={buyerInfo?.url}
                                    onChange={e => setBuyerInfo({...buyerInfo, 
                                        url: e.target.value,
                                    })}
                                />
                            </div>

                            <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Drzava')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="1000"
                                    value={buyerInfo?.drzava}
                                    onChange={e => setBuyerInfo({...buyerInfo, 
                                        drzava: e.target.value,
                                    })}
                                />
                            </div>

                            <div className="flex flex-col lg:col-span-2 xs:col-span-6">
                                    <div className="vtk-seller-field-label">{i18n('Avatar')}</div>
                                    <UploadImageButton
                                        className="w-10 h-10 mr-2 uppercase"
                                        onOpenFile={onSelectImage}
                                        cropRange={BuyerAvatarImageOpts}
                                        cropRatio={1}
                                    >
                                        {<Icon className="text-black w-full h-full" icon="camera" />}
                                    </UploadImageButton>
                                    {submittingImage ? (
                                        <div className="mt-4 mb-4">
                                            <Loading />
                                        </div>
                                    ) : imagePreview ? (
                                        <div className="mt-4 mb-4 flex flex-col">
                                            <div className="py-4 mb-4">{'Novi avatar koji će biti postavljen:'}</div>
                                            <div className="user-avatar">
                                                <img className="mt-4" src={imagePreview} />
                                            </div>
                                        </div>
                                    ) : buyerInfo?.photo?.url ? (
                                        <div className="text-center md:text-left flex flex-col">
                                            <div className="py-4 mb-4">{'Trenutni avatar:'}</div>
                                            <div className="user-avatar">
                                                <img className="mt-4" src={buyerInfo?.photo?.url} className="inline-block" />
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className="text-greyText text-xs mt-1">{i18n('Maksimalna veličina fajla 2mb')}</div>
                                </div>
                        </>
                    )}
                    <div className="flex flex-row mt-20">
                        <div onClick={e => onQuit(e)} className="button signup-button mr-auto">
                            {i18n('Odustanite')}
                        </div>
                        <button className="button login-button ml-auto" type="submit">
                            {i18n('Sačuvajte i nastavite')}
                        </button>
                    </div>
                </Form>
            </div>
        </>
	);
};
export default BuyerProfile;
