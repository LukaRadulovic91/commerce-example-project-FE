import _ from 'lodash';
import { useState, useEffect, useRef } from 'react';

import Actions from '@/actions';
import ReduxState from '@/modules/ReduxState';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link, useHistory } from 'react-router-dom';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import Icon from '@ui/Icon';
import Loading from '@ui/Loading';
import UploadImageButton from '@ui/UploadImageButton';
import SellerLogoImageOpts from '../../models/SellerLogoImageOpts';
import Dropdown from '@ui/Dropdown';

const SellerBasicInfoForm = props => {
	const i18n = Hooks.useI18n();
    const history = useHistory();
	const userData = Hooks.useUser();
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [submittingImage, setSubmittingImage] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [existingUserNaziv, setExistingUserNaziv] = useState(null);
    const [existingUserJib, setExistingUserJib] = useState(null);
    const [selectedMjesto, setSelectedMjesto] = useState(null);
    const [basicInfo, setBasicInfo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [mjesta, setMjesta] = useState([]);

    const handleSelectMjesto = mjesto => {
        setSelectedMjesto(mjesto);
        setBasicInfo({...basicInfo, 
            postanski_broj: mjesto.postanski_broj,
        })
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
				if (response.success && response.message == "OK") {
                    const logo = response.data.files[0];
                    setBasicInfo({...basicInfo, 
                        photo_logo: logo,
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
            api: '/sellers/' + userData.id + '/osnovni-podaci',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message === "OK") {
                    let basicInfo = response.data;
                    setBasicInfo(basicInfo);
                    setIsExistingUser(true);
                    setExistingUserJib(basicInfo.jib);
                    setExistingUserNaziv(basicInfo.naziv);
                    setSelectedMjesto(mjesta.find( mjesto => mjesto.id === basicInfo?.mjesto?.id))
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
        ajaxGET({
            api: '/mjesto',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message === "OK") {
                    let mjesta = response.data;
                    setMjesta(mjesta);
                    setSelectedMjesto(mjesta.find( mjesto => mjesto.id === basicInfo?.mjesto?.id))
                } else {
                }  
            },
            error: (status, errorMessage) => {
				if (status === 401) {
                    Actions.cleanupLogin(true);
                    window.location = '/login';
                }
			},
            infiniteRetries: false,
        });
	}, []);

    useEffect(() => {
        setSelectedMjesto(mjesta.find( mjesto => mjesto.id === basicInfo?.mjesto?.id))
    }, [mjesta, basicInfo?.mjesto?.id]);

	const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
        }
        
        let sellerData =  basicInfo;

        sellerData.postanski_broj = selectedMjesto?.postanski_broj;
        sellerData.mjesto = selectedMjesto;
        if (sellerData.id) {
            delete sellerData.id;
        }
        delete sellerData.jib;
        delete sellerData.vtk_forma_korak;

        if (sellerData.photo_logo) {
            delete sellerData.photo_logo?.name;
        }
        
		setSubmitting(true);
		ajaxPOST({
			api: '/sellers/' + userData.id + '/osnovni-podaci',
			data: sellerData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    Persistence.set('vtk_form_step_filled', 1);
                    Actions.setUser({...userData, vtk_forma_korak: 1});
                    history.push("/vtk_form/activity");
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

    const onQuit = e => {
		e.stopPropagation();
        Actions.confirm(
			i18n('Da li Ste sigurni?'),
			i18n('Izmjene neće biti sačuvane.'),
            () => history.push('/')
		);
    }

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
    
	return (
		<div className="vtk-seller-form-container">
            <div className="mx-5 mt-4 mb-2 font-semibold">
                {i18n('Molimo Vas provjerite ispravnost podataka koje imamo u bazi, ispravite ukoliko isti nisu ispravni te popunite podatke koji nedostaju.')}
            </div>
            <div className="mx-5 my-2 font-semibold">
                {i18n('Projekat je rađen u koordinaciji sa VTK BiH i postojeći podaci su preuzeti iz baze podataka VTK BiH.')}
            </div>
            <div className="mx-5 my-2 font-semibold text-orange">
                {i18n('* Polja označena zvjezdicom su obavezna za unos')}
            </div>
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
                            {i18n('Osoba koja je popunila podatke')}
                        </div>
                        <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                            <div className="flex flex-col lg:col-span-2 xs:col-span-2">
                                <div className="vtk-seller-field-label">{i18n('Prefiks*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="20"
                                    value={basicInfo?.registrant_prefiks}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        registrant_prefiks: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="lg:col-span-10 xs:col-span-0"/>
                            <div className="flex flex-col lg:col-span-5 xs:col-span-10">
                                <div className="vtk-seller-field-label">{i18n('Ime i prezime*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    value={basicInfo?.registrant_ime_i_prezime}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        registrant_ime_i_prezime: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Pozicija u kompaniji*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    value={basicInfo?.registrant_pozicija}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        registrant_pozicija: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Direktan telefon*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    value={basicInfo?.registrant_telefon}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        registrant_telefon: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Email*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    type="email"
                                    value={basicInfo?.registrant_email}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        registrant_email: e.target.value,
                                    })}
                                />
                            </div>
                        </div>

                        <div className="vtk-seller-section-header">
                            {i18n('Osnovni Podaci o kompaniji')}
                        </div>
                        <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                            <div className="flex flex-col lg:col-span-10 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Naziv privrednog subjekta*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="512"
                                    required
                                    value={basicInfo?.naziv}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        naziv: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('JIB / ID broj*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    disabled={isExistingUser && existingUserJib !== null && existingUserJib !== ''}
                                    value={basicInfo?.jib}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        jib: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-8  xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Adresa sjedišta*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="512"
                                    required
                                    value={basicInfo?.adresa}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        adresa: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Mjesto*')}</div>
                                <Dropdown
                                    enableSearch
                                    className="vtk-seller-form-dropdown required"
                                    label={i18n('Izaberite mjesto')}
                                    onChange={e => handleSelectMjesto(e)}
                                    value={selectedMjesto}
                                >
                                    {_.map(mjesta, mjesto => (
                                        <Dropdown.Item key={mjesto.postanski_broj} value={mjesto} className="">
                                            {mjesto.naziv}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown>
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Poštanski broj*')}</div>
                                <TextField
                                    type="number"
                                    className={'vtk-seller-field-input required'}
                                    maxLength="10"
                                    required
                                    value={basicInfo?.postanski_broj}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        postanski_broj: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Kontakt telefon*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    value={basicInfo?.telefon}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        telefon: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Fax*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    value={basicInfo?.fax}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        fax: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Email*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    type="email"
                                    value={basicInfo?.email}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        email: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Web sajt')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="1000"
                                    value={basicInfo?.website}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        website: e.target.value,
                                    })}
                                />
                            </div>
                        </div>

                        <div className="vtk-seller-section-header">
                            {i18n('Dodatne informacije o kompaniji')}
                        </div>
                        <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                            <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Direktor / Odgovorno lice*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="254"
                                    required
                                    value={basicInfo?.odgovorno_lice}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        odgovorno_lice: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-4">
                                <div className="vtk-seller-field-label">{i18n('Godina osnivanja')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    required
                                    maxLength={4}
                                    type="number"
                                    min={1000}
                                    max={2100}
                                    value={basicInfo?.godina_osnivanja}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        godina_osnivanja: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-4">
                                <div className="vtk-seller-field-label">{i18n('Broj zaposlenih')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    required
                                    maxLength="254"
                                    value={basicInfo?.broj_zaposlenih}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        broj_zaposlenih: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-4">
                                <div className="vtk-seller-field-label">{i18n('Godišnji prihod u EUR')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="254"
                                    value={basicInfo?.godisnji_prihod}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        godisnji_prihod: e.target.value,
                                    })}
                                />
                            </div>
                        </div>

                        <div className="vtk-seller-section-header">
                            {i18n('Kontakt osoba za informacije o proizvodima ili uslugama')}
                        </div>
                        <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                            <div className="flex flex-col lg:col-span-5 xs:col-span-10">
                                <div className="vtk-seller-field-label">{i18n('Ime i prezime*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="255"
                                    required
                                    value={basicInfo?.kontakt_osoba_ime}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        kontakt_osoba_ime: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Pozicija u kompaniji*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="255"
                                    required
                                    value={basicInfo?.kontakt_osoba_pozicija}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        kontakt_osoba_pozicija: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                <div className="vtk-seller-field-label">{i18n('Direktan telefon*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="50"
                                    required
                                    value={basicInfo?.kontakt_osoba_telefon}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        kontakt_osoba_telefon: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Email*')}</div>
                                <TextField
                                    className={'vtk-seller-field-input required'}
                                    maxLength="255"
                                    required
                                    type="email"
                                    value={basicInfo?.kontakt_osoba_email}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        kontakt_osoba_email: e.target.value,
                                    })}
                                />
                            </div>
                        </div>

                        <div className="vtk-seller-section-header">
                            {i18n('Promotivni materijali')}
                        </div>
                        <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                            <div className="flex flex-col lg:col-span-2 xs:col-span-6">
                                <div className="vtk-seller-field-label">{i18n('Logo kompanije')}</div>
                                <UploadImageButton
                                    className="w-10 h-10 mr-2 uppercase"
                                    onOpenFile={onSelectImage}
                                    cropRange={SellerLogoImageOpts}
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
                                        <div className="py-4 mb-4">{'Novi logo koji će biti postavljen:'}</div>
                                        <div>
                                            <img className="mt-4" src={imagePreview} />
                                        </div>
                                    </div>
                                ) : basicInfo?.photo_logo?.url ? (
                                    <div className="text-center md:text-left">
                                        <div className="py-4 mb-4">{'Trenutni logo:'}</div>
                                        <div>
                                            <img className="mt-4" src={basicInfo?.photo_logo?.url} className="inline-block" />
                                        </div>
                                    </div>
                                ) : null}
                                <div className="text-greyText text-xs mt-1">{i18n('Maksimalna veličina fajla 2mb')}</div>
                            </div>
                            <div className="flex flex-col lg:col-span-5 xs:col-span-4">
                                <div className="vtk-seller-field-label">{i18n('Link na Vaš katalog proizvoda u PDF formatu')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="255"
                                    value={basicInfo?.link_katalog_pdf}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        link_katalog_pdf: e.target.value,
                                    })}
                                />
                            </div>
                            <div className="flex flex-col lg:col-span-5 xs:col-span-4">
                                <div className="vtk-seller-field-label">{i18n('Link na Vaš promotivni video materijal')}</div>
                                <TextField
                                    className={'vtk-seller-field-input'}
                                    maxLength="255"
                                    value={basicInfo?.link_promo_video}
                                    onChange={e => setBasicInfo({...basicInfo, 
                                        link_promo_video: e.target.value,
                                    })}
                                />
                            </div>
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
	);
};
export default SellerBasicInfoForm;
