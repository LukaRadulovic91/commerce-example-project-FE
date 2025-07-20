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
import Dropdown from '@ui/Dropdown';
import Loading from '@ui/Loading';
import UploadImageButton from '@ui/UploadImageButton';
import SellerServiceImageOpts from '../../models/SellerServiceImageOpts';

const SellerHSClassificationForm = props => {
	const i18n = Hooks.useI18n();
    const history = useHistory();
    const userData = Hooks.useUser();
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [submittingImage, setSubmittingImage] = useState(null);
    const [isProducer, setIsProducer] = useState(true);
    const [isServiceProvider, setIsServiceProvider] = useState(false);
    const [HSKlasifikacije, setHSKlasifikacije] = useState();
    const [proizvodiIliUsluge, setProizvodiIliUsluge] = useState(_.map([0,1,2,3,4], (n,i) => ({ index: i, naziv: '', opis: '', barkod: '', hs: null, photo_1: { id: '', url: ''}, photo_2:  { id: '', url: ''}, photo_3:  { id: '', url: ''}, photo_4:  { id: '', url: ''}})));
    
    const handleChangeUslugaNaziv = (naziv, index) => {
        let uslugeArr = [...proizvodiIliUsluge];
        uslugeArr[index].naziv = naziv;
        setProizvodiIliUsluge(uslugeArr);
    };

    const handleChangeUslugaOpis = (opis, index) => {
        let uslugeArr = [...proizvodiIliUsluge];
        uslugeArr[index].opis = opis;
        setProizvodiIliUsluge(uslugeArr);
    };

    const handleChangeUslugaBarkod = (barkod, index) => {
        let uslugeArr = [...proizvodiIliUsluge];
        uslugeArr[index].barkod = barkod;
        setProizvodiIliUsluge(uslugeArr);
    };

    const handleChangeUslugaHS = (hsKod, index) => {
        let uslugeArr = [...proizvodiIliUsluge];
        uslugeArr[index].hs = hsKod;
        setProizvodiIliUsluge(uslugeArr);
    } 

    const removeUslugu = index => {
        let uslugeArr = [...proizvodiIliUsluge];
        uslugeArr[index] = { index: index, naziv: '', opis: '', barkod: '', hs: null, photo_1: { id: '', url: ''}, photo_2:  { id: '', url: ''}, photo_3:  { id: '', url: ''}, photo_4:  { id: '', url: ''}};
        setProizvodiIliUsluge(uslugeArr);
    };

    const onSelectImage = (imageData, usluga, foto_index) => {
		const url = URL.createObjectURL(imageData);
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 30000);

        if (submitting) {
			return;
        }
        
		setSubmitting(true);
        setSubmittingImage({usluga: usluga, foto_index: foto_index});

        const formData = new FormData();
        const fileName = 'ProductImage_' + foto_index + '_user_id_' + userData.id;
        formData.append(fileName, imageData);

        ajaxPOST({
			api: '/files/save',
			data: formData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    const id = response.data.files[0]?.id;

                    usluga[foto_index].id = id;
                    usluga[foto_index].preview = url;
                    let uslugeArr = [...proizvodiIliUsluge];
                    uslugeArr[usluga.index] = usluga;
                    setProizvodiIliUsluge(uslugeArr);
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
			},
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
			finally: () => {
				setSubmitting(false);
                setSubmittingImage(null);
			},
		});
    };

    const [seller, setSeller] = useState(null);

    const [sellerHSClassifications, setSellerHSClassifications] = useState([]);
    const [validHSList, setValidHSList] = useState([]);

    const handleSetSellerHSClassifications = hs => {
        setSellerHSClassifications(hs);
        let validHSCodes = [];
        for (let hsc of hs) {
            validHSCodes.push(hsc.hs);
        }
        setValidHSList(validHSCodes);
    }

    const removeHSClassification = hs => {
        let filteredHSCodes = _.filter(sellerHSClassifications, c => c.hs.id !== hs.hs.id);
        setSellerHSClassifications(filteredHSCodes);
        let validHSCodes = [];
        for (let hsc of filteredHSCodes) {
            validHSCodes.push(hsc.hs);
        }
        setValidHSList(validHSCodes);
    }

    const setHSKolicina = (value, id) => {
        setSellerHSClassifications((prevHS) => 
            prevHS.map((hs) => {
                return hs.hs.id === id ? {...hs, godisnja_kolicina: value} : hs;
            }));
    }

    useEffect(() => {
        ajaxGET({
            api: '/sellers/' + userData.id + '/carinske-tarife',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let seller = response.data;

                    setIsProducer(seller.djelatnost_proizvodna);
                    setIsServiceProvider(seller.djelatnost_usluzna);

                    handleSetSellerHSClassifications(seller.carinske_tarife);
                    let proizvodiIliUslugeToSave = [...proizvodiIliUsluge];
                    if (seller.kljucni_proizvodi && seller.kljucni_proizvodi.length > 0) {
                        for (let u of proizvodiIliUslugeToSave) {
                            if (seller.kljucni_proizvodi[u.index]) {
                                u.id = seller.kljucni_proizvodi[u.index].id;
                                u.naziv = seller.kljucni_proizvodi[u.index].naziv;
                                u.opis = seller.kljucni_proizvodi[u.index].opis;
                                u.barkod = seller.kljucni_proizvodi[u.index].barkod;
                                u.hs = seller.kljucni_proizvodi[u.index].hs;
                                u.photo_1 = seller.kljucni_proizvodi[u.index].photo_1 ? seller.kljucni_proizvodi[u.index].photo_1 : { id: '', url: ''};
                                u.photo_2 = seller.kljucni_proizvodi[u.index].photo_2 ? seller.kljucni_proizvodi[u.index].photo_2 : { id: '', url: ''};
                                u.photo_3 = seller.kljucni_proizvodi[u.index].photo_3 ? seller.kljucni_proizvodi[u.index].photo_3 : { id: '', url: ''};
                                u.photo_4 = seller.kljucni_proizvodi[u.index].photo_4 ? seller.kljucni_proizvodi[u.index].photo_4 : { id: '', url: ''};
                            }
                        }
                    }
                    setProizvodiIliUsluge(proizvodiIliUslugeToSave);
                    setSeller(seller);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
            finally: () => {
                setFetching(false);
            },
            infiniteRetries: false,
        });

        ajaxGET({
            api: '/hs',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let hs = response.data;
                    setHSKlasifikacije(hs);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
            infiniteRetries: false,
        });
	}, []);

	const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
        }

        let hsCodeMissingFromProduct = false;
        let amountMissing = false;
        
        let hsData = {};
        let hsToSubmit = [];
        for (let hsc of sellerHSClassifications) {
            delete hsc.hs.children
            if (hsc.godisnja_kolicina === 0 || hsc.godisnja_kolicina === '0') {
                amountMissing = true;
            }
            hsToSubmit.push(hsc)
        }
        hsData.carinske_tarife = hsToSubmit;

        let uslugeToSubmit = [];
        for (let u of proizvodiIliUsluge) {
            if (u.naziv !== '') {
                let usluga = { id: u.id, naziv: u.naziv, opis: u.opis, barkod: u.barkod, hs: u.hs ? { id: u.hs?.id, opis: u.hs?.opis, nivo: u.hs?.nivo } : null, photo_1: { id: u.photo_1?.id, url: u.photo_1?.url }, photo_2: { id: u.photo_2?.id, url: u.photo_2?.url }, photo_3: { id: u.photo_3?.id, url: u.photo_3?.url }, photo_4: { id: u.photo_4?.id, url: u.photo_4?.url }}
                if (isProducer && !usluga.hs) {
                    hsCodeMissingFromProduct = true;
                }
                uslugeToSubmit.push(usluga);
            }
        }
        if (uslugeToSubmit?.length < 1) {
            Actions.addModal('Obavezno polje', 'Molimo dodajte najmanje jednu uslugu ili proizvod.');
            return;
        }
        if (hsCodeMissingFromProduct) {
            Actions.addModal('Obavezno polje', 'Molimo dodjelite HS kodove svim proizvodima.');
            return;
        }
        if (amountMissing) {
            Actions.addModal('Obavezno polje', 'Molimo dodjelite količine svim proizvodima.');
            return;
        }

        hsData.kljucni_proizvodi = uslugeToSubmit;
        
		setSubmitting(true);
		ajaxPOST({
			api: '/sellers/' + userData.id + '/carinske-tarife',
			data: hsData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    Persistence.set('vtk_form_step_filled', 4);
                    Actions.setUser({...userData, vtk_forma_korak: 4});
                    history.push("/vtk_form/market");
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
			},
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
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
                {!fetching && isProducer ? (
                    <>
                        <div className="vtk-seller-section-header">
                            {i18n('Carinske tarife')}
                        </div>
                        {!sellerHSClassifications || (sellerHSClassifications.length <= 0) ? (
                            <>
                                <div className="vtk-seller-find-nace-prompt wide mt-10">{i18n('U cilju što adekvatnije prezentacije asortimana, molimo Vas da odredite carinske tarife (HS kod) svih Vaših proizvoda.')}</div>
                                <div className="vtk-seller-find-nace-prompt wide">{i18n('Pretragu i određivanje carinske tarife (HS koda) Vaših proizvoda možete raditi po vrsti proizvoda ili po broju koji određuje vrstu Vašeg proizvoda.')}</div>
                                <div className="vtk-seller-find-nace-prompt wide">{i18n('Za dodatna pitanja ili nejasnoće molimo Vas da koristite korisničko uputstvo ili nas kontaktirate na support@digitalnakomora.ba')}</div>
                                <div 
                                    className={'vtk-seller-find-nace-button justify-center flex px-20 mx-auto mt-10' + (!HSKlasifikacije || HSKlasifikacije.length === 0 ? ' disabled' : '')}
                                    disabled={!HSKlasifikacije || HSKlasifikacije.length === 0}
                                    onClick={!HSKlasifikacije || HSKlasifikacije.length === 0 ? null :
                                        () => 
                                        Actions.showHSModal(
                                            'Pronađite carinsku tarifu za svoj proizvod (HS Kod)',
                                            HSKlasifikacije,
                                            sellerHSClassifications,
                                            (hs) => handleSetSellerHSClassifications(hs),
                                            false
                                        )
                                }>{!HSKlasifikacije || HSKlasifikacije.length === 0 ? i18n('Podaci se učitavaju, molimo sačekajte.') : i18n('Pronađite svoju tarifnu stopu (HS Kod)')}</div>
                                <div className="h-60" />
                            </>
                        ) : (
                            <>
                                <div className="vtk-nace-table-header h-14 md:h-6">
                                    <span className="w-4 mr-2" />
                                    <span className="w-1/5 ml-1">{i18n('Carinska tarifa (HS kod)')}</span>
                                    <span className="w-3/5">{i18n('Naziv carinske tarife')}</span>
                                    <span className="flex w-1/5">{i18n('Godišnja količina')}</span>
                                </div>
                                <div className="vtk-nace-table-body">
                                {sellerHSClassifications.map((hs, i) => (
                                    <div key={hs.hs.id} className="vtk-nace-table-row font-semibold">
                                        <div className="vtk-nace-table-row-segment flex flex-row md:w-4/5 w-full">
                                            <div className="w-4 mr-2">{i + 1 + '.'}</div>
                                            <div className="vtk-nace-table-field ml-1 w-1/5">{hs.hs.id}</div>
                                            <div className="vtk-nace-table-field mx-2 truncate w-4/5">{hs.hs?.opis?.substring(0, 100)}{hs.hs?.opis?.length > 100 ? '...' : ''}</div>
                                        </div>
                                        <div className="vtk-nace-table-row-segment flex md:w-1/5 md:ml-0 ml-7 w-full">
                                            <TextField
                                                className={'vtk-nace-table-textfield attention-border'}
                                                maxLength="254"
                                                type="number"
                                                placeholder={i18n('Godišnja količina')}
                                                required
                                                value={hs.godisnja_kolicina}
                                                onChange={e => setHSKolicina(e.target.value, hs.hs.id)}
                                            />
                                            <div className="button ml-2" 
                                                disabled={!HSKlasifikacije || HSKlasifikacije.length === 0}
                                                onClick={!HSKlasifikacije || HSKlasifikacije.length === 0 ? null :
                                                    () => Actions.showHSModal(
                                                    'Pronadjite carinsku tarifu za svoj proizvod (HS kod)',
                                                    HSKlasifikacije,
                                                    sellerHSClassifications,
                                                    (hs) => handleSetSellerHSClassifications(hs),
                                                    false
                                                )}
                                            >
                                                <Icon icon="edit" />
                                            </div>
                                            <div className="button mx-2" onClick={() => removeHSClassification(hs)}>
                                                <Icon icon="trash" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div />
                )}
                {!fetching && isProducer || isServiceProvider ? (
                    <>
                        <div className="vtk-seller-section-header">
                            {isProducer ? isServiceProvider ? (i18n('Ključni proizvodi/usluge Vaše kompanije')) : (i18n('Ključni proizvodi Vaše kompanije')) : (i18n('Ključne usluge Vaše kompanije'))}
                        </div>
                        <div className="vtk-usluge-table-body">
                            {_.map(proizvodiIliUsluge, u => (
                                <div key={u.index} className="vtk-usluge-table-row flex flex-row w-full grid grid-cols-12 gap-2 mb-2">
                                    <div className="flex flex-col lg:col-span-4 xs:col-span-12">
                                        <div className="vtk-seller-field-label">{isProducer ? isServiceProvider ? (i18n('Naziv proizvoda/usluge')) : (i18n('Naziv proizvoda')) : (i18n('Naziv usluge'))}</div>
                                        <TextField
                                            className={'vtk-seller-field-input'}
                                            maxLength="255"
                                            value={u.naziv}
                                            required={u.barkod !== '' || u.hs}
                                            onChange={ e => handleChangeUslugaNaziv(e.target.value, u.index)}
                                        />
                                    </div>
                                    
                                    {isProducer && 
                                        <>
                                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                                <div className="vtk-seller-field-label">{i18n('Barkod')}</div>
                                                <TextField
                                                    className={'vtk-seller-field-input'}
                                                    maxLength="255"
                                                    value={u.barkod}
                                                    onChange={ e => handleChangeUslugaBarkod(e.target.value, u.index)}
                                                />
                                            </div>
                                            <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                                                <div className="vtk-seller-field-label">{i18n('Carinska tarifa')}</div>
                                                <Dropdown
                                                    className="vtk-seller-form-dropdown required"
                                                    label={i18n('Izaberite HS kod')}
                                                    onChange={e => handleChangeUslugaHS(e, u.index)}
                                                    value={u?.hs}
                                                >
                                                    {u.hs && u.hs !== null && ( 
                                                        <Dropdown.Item value={u.hs} className="">
                                                            {u.hs.id}
                                                        </Dropdown.Item>
                                                    )}
                                                    {_.map(validHSList, hs => (
                                                        <Dropdown.Item key={hs.id} value={hs} className="">
                                                            {hs.id}
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown>
                                            </div>
                                        </>
                                    }
                                    <div className={'flex flex-row xs:col-span-12 mt-9 ml-auto' + (isProducer ? ' lg:col-span-4' : ' lg:col-span-8')}>
                                        <UploadImageButton
                                            className="w-10 h-10 mr-2 uppercase px-2 py-2"
                                            onOpenFile={ imageData => onSelectImage(imageData, u, 'photo_1')}
                                            cropRange={SellerServiceImageOpts}
                                            cropRatio={1}
                                        >
                                            {submittingImage?.usluga === u && submittingImage?.foto_index === 'photo_1' ? (
                                                <div className="mt-4 mb-4">
                                                    <Loading />
                                                </div>
                                            ) : u.photo_1?.preview ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_1.preview} />
                                                </div>
                                            ) : u.photo_1?.url ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_1.url} />
                                                </div>
                                            ) : (
                                                <Icon className="text-black w-full h-full" icon="camera" />
                                            )}
                                        </UploadImageButton>
                                        <UploadImageButton
                                            className="w-10 h-10 mr-2 uppercase px-2 py-2"
                                            onOpenFile={ imageData => onSelectImage(imageData, u, 'photo_2')}
                                            cropRange={SellerServiceImageOpts}
                                            cropRatio={1}
                                        >
                                            {submittingImage?.usluga === u && submittingImage?.foto_index === 'photo_2' ? (
                                                <div className="mt-4 mb-4">
                                                    <Loading />
                                                </div>
                                            ) : u.photo_2?.preview ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_2.preview} />
                                                </div>
                                            ) : u.photo_2?.url ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_2.url} />
                                                </div>
                                            ) : (
                                                <Icon className="text-black w-full h-full" icon="camera" />
                                            )}
                                        </UploadImageButton>
                                        <UploadImageButton
                                            className="w-10 h-10 mr-2 uppercase px-2 py-2"
                                            onOpenFile={ imageData => onSelectImage(imageData, u, 'photo_3')}
                                            cropRange={SellerServiceImageOpts}
                                            cropRatio={1}
                                        >
                                            {submittingImage?.usluga === u && submittingImage?.foto_index === 'photo_3' ? (
                                                <div className="mt-4 mb-4">
                                                    <Loading />
                                                </div>
                                            ) : u.photo_3?.preview ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_3.preview} />
                                                </div>
                                            ) : u.photo_3?.url ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_3.url} />
                                                </div>
                                            ) : (
                                                <Icon className="text-black w-full h-full" icon="camera" />
                                            )}
                                        </UploadImageButton>
                                        <UploadImageButton
                                            className="w-10 h-10 mr-2 uppercase px-2 py-2"
                                            onOpenFile={ imageData => onSelectImage(imageData, u, 'photo_4')}
                                            cropRange={SellerServiceImageOpts}
                                            cropRatio={1}
                                        >
                                            {submittingImage?.usluga === u && submittingImage?.foto_index === 'photo_4' ? (
                                                <div className="mt-4 mb-4">
                                                    <Loading />
                                                </div>
                                                ) : u.photo_4?.preview ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_4.preview} />
                                                </div>
                                            ) : u.photo_4?.url ? (
                                                <div className="w-full h-full">
                                                    <img className="w-full h-full" src={u.photo_4.url} />
                                                </div>
                                            ) : (
                                                <Icon className="text-black w-full h-full" icon="camera" />
                                            )}
                                        </UploadImageButton>
                                        
                                        <div className="button mr-2 ml-4 w-10 h-10" onClick={() => removeUslugu(u.index)}>
                                            <Icon icon="trash" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col col-span-12">
                                    <div className="vtk-seller-field-label">{isProducer ? isServiceProvider ? (i18n('Opis proizvodi/usluge')) : (i18n('Opis proizvoda')) : (i18n('Opis usluge'))}</div>
                                        <TextField
                                            className={'vtk-seller-field-input'}
                                            maxLength="512"
                                            value={u.opis}
                                            onChange={ e => handleChangeUslugaOpis(e.target.value, u.index)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : !fetching ? (
                    <div className="mx-20 my-20 text-center text-greyText text-xl">
                        {i18n('Podatke na ovom ekranu popunjavaju kompanije koje imaju proizvodnu i/ili uslužnu djelatnost.')}
                    </div>
                ) : (<Loading />)}
				<div className="flex flex-row flex-end mt-10">
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
export default SellerHSClassificationForm;
