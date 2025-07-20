import _ from 'lodash';
import { useState, useEffect } from 'react';

import Actions from '@/actions';
import ReduxState from '@/modules/ReduxState';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link, useHistory } from 'react-router-dom';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import Checkbox from '../ui/Checkbox';
import Loading from '@ui/Loading';
import Icon from '@ui/Icon';
import UploadImageButton from '@ui/UploadImageButton';
import SellerServiceImageOpts from '../../models/SellerServiceImageOpts';

const SellerNACEClassificationForm = props => {
	const i18n = Hooks.useI18n();
    const history = useHistory();
    const userData = Hooks.useUser();
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [submittingImage, setSubmittingImage] = useState(null);
    const [isProducer, setIsProducer] = useState(false);
    const [isServiceProvider, setIsServiceProvider] = useState(false);
    const [usluge, setUsluge] = useState(_.map([0,1,2,3,4], (n,i) => ({ index: i, naziv: '', opis: '', photo_1: { id: '', url: ''}, photo_2:  { id: '', url: ''}, photo_3:  { id: '', url: ''}, photo_4:  { id: '', url: ''}})));
    
    const [NACEKlasifikacije, setNACEKlasifikacije] = useState();
    const [sellerNaceClassifications, setSellerNaceClassifications] = useState([]);
    const [seller, setSeller] = useState(null);

    const removeNaceClassification = nace => {
        setSellerNaceClassifications(_.filter(sellerNaceClassifications, c => c.id !== nace.id));
    }

    useEffect(() => {
        ajaxGET({
            api: '/sellers/' + userData.id + '/nace-klasifikacija',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let seller = response.data;
                    setSeller(seller);
                    let klasifikacije = [];
                    if (seller.nace_klasifikacije && seller.nace_klasifikacije.length > 0) {
                        for (let nc of seller.nace_klasifikacije) {
                            klasifikacije.push(nc.nace);
                        }
                    }
                    setSellerNaceClassifications(klasifikacije);
                    let uslugeToSave = [...usluge];
                    if (seller.usluge && seller.usluge.length > 0) {
                        for (let u of uslugeToSave) {
                            if (seller.usluge[u.index]) {
                                u.id = seller.usluge[u.index].id;
                                u.naziv = seller.usluge[u.index].naziv;
                                u.opis = seller.usluge[u.index].opis;
                                u.photo_1 = seller.usluge[u.index].photo_1 ? seller.usluge[u.index].photo_1 : { id: '', url: ''};
                                u.photo_2 = seller.usluge[u.index].photo_2 ? seller.usluge[u.index].photo_2 : { id: '', url: ''};
                                u.photo_3 = seller.usluge[u.index].photo_3 ? seller.usluge[u.index].photo_3 : { id: '', url: ''};
                                u.photo_4 = seller.usluge[u.index].photo_4 ? seller.usluge[u.index].photo_4 : { id: '', url: ''};
                            }
                        }
                    }
                    setUsluge(uslugeToSave);

                    setIsProducer(seller.djelatnost_proizvodna !== null ? seller.djelatnost_proizvodna : false);
                    setIsServiceProvider(seller.djelatnost_usluzna !== null ? seller.djelatnost_usluzna : false);
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
            api: '/nace',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let nace = response.data;
                    setNACEKlasifikacije(nace);
                } else {
                }  
            },
            error: (status, errorMessage) => {
                handleError(status, errorMessage)
			},
            infiniteRetries: false,
        });
    }, []);
    
    const handleChangeUslugaNaziv = (naziv, index) => {
        let uslugeArr = [...usluge];
        uslugeArr[index].naziv = naziv;
        setUsluge(uslugeArr);
    }

    const handleChangeUslugaOpis = (opis, index) => {
        let uslugeArr = [...usluge];
        uslugeArr[index].opis = opis;
        setUsluge(uslugeArr);
    }

    const removeUslugu = index => {
        let uslugeArr = [...usluge];
        uslugeArr[index] = { index: index, naziv: '', opis: '', photo_1:  { id: '', url: ''}, photo_2:  { id: '', url: ''}, photo_3:  { id: '', url: ''}, photo_4:  { id: '', url: ''}};
        setUsluge(uslugeArr);
    }

    const onSelectImage = (imageData, usluga, foto_index) => {
        if (submitting) {
			return;
        }
        
		setSubmitting(true);
        setSubmittingImage({usluga: usluga, foto_index: foto_index});

		const url = URL.createObjectURL(imageData);
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
                    const id = response.data.files[0]?.id;

                    usluga[foto_index].id = id;
                    usluga[foto_index].preview = url;
                    
                    let uslugeArr = [...usluge];
                    uslugeArr[usluga.index] = usluga;
                    setUsluge(uslugeArr);
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

	const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
        }
        
        let naceData = {};
        naceData.djelatnost_proizvodna = isProducer;
        naceData.djelatnost_usluzna = isServiceProvider;
        
        let naceToSubmit = [];
        for (let nc of sellerNaceClassifications) {
            naceToSubmit.push({ nace: nc })
        }

        if (naceToSubmit?.length < 1) {
            Actions.addModal('Obavezno polje', 'NACE klasifikacija je obavezno polje.');
            return;
        }

        naceData.nace_klasifikacije = naceToSubmit;

        let uslugeToSubmit = [];
        for (let u of usluge) {
            if (u.naziv !== '') {
                let usluga = { naziv: u.naziv, opis: u.opis, photo_1: { id: u.photo_1?.id, url: u.photo_1?.url }, photo_2: { id: u.photo_2?.id, url: u.photo_2?.url }, photo_3: { id: u.photo_3?.id, url: u.photo_3?.url }, photo_4: { id: u.photo_4?.id, url: u.photo_4?.url }}
                uslugeToSubmit.push(usluga);
            }
        }

        if (naceData.djelatnost_usluzna && uslugeToSubmit?.length < 1) {
            Actions.addModal('Obavezno polje', 'Molimo Vas dodajte najmanje jednu uslugu.');
            return;
        }

        naceData.usluge = uslugeToSubmit;
        if (naceData.id) {
            delete naceData.id;
        }

		setSubmitting(true);
		ajaxPOST({
			api: '/sellers/' + userData.id + '/nace-klasifikacija',
			data: naceData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    Persistence.set('vtk_form_step_filled', 3);
                    Actions.setUser({...userData, vtk_forma_korak: 3});
                    history.push("/vtk_form/hs");
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
                {fetching ? (
                    <Loading />
                ) : (
                <>
                <div className="vtk-seller-section-header truncate">
                    {i18n('Vrsta djelatnosti vaše kompanije')}
                </div>
                <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 mt-4 ">
                    <div className="flex col-span-6 lg:col-span-3">
                        <Checkbox
                            type={'checkbox-first'}
                            checked={isProducer}
                            onChange={() => setIsProducer(!isProducer)}
							label={
								<div className="font-bold uppercase">{i18n('Proizvodna')}</div>
							}
						/>
                    </div>
                    <div className="flex col-span-6 lg:col-span-3">
                        <Checkbox
                            type={'checkbox-first'}
                            checked={isServiceProvider}
                            onChange={() => setIsServiceProvider(!isServiceProvider)}
							label={
								<div className="font-bold uppercase">{i18n('Uslužna')}</div>
							}
						/>
                    </div>
                </div>

                {(isProducer || isServiceProvider) && (
                    <>
                        <div className="vtk-seller-section-header">
                            {i18n('NACE Klasifikacija djelatnosti kompanije (SKD)')}
                        </div>
                        {!sellerNaceClassifications || (sellerNaceClassifications.length <= 0) ? (
                            <>
                                <div className="vtk-seller-find-nace-prompt pt-32">{i18n('Izaberite standardnu klasifikaciju djelatnosti prema međunarodnoj NACE klasifikaciji')}</div>
                                <div 
                                    className="vtk-seller-find-nace-button mx-auto"
                                    onClick={!NACEKlasifikacije || NACEKlasifikacije.length === 0 ? null :
                                        () => 
                                        Actions.showNACEModal(
                                            'Pronadjite djelatnosti prema NACE klasifikaciji',
                                            NACEKlasifikacije,
                                            sellerNaceClassifications,
                                            (nace) => setSellerNaceClassifications(nace),
                                            false
                                        )
                                }>{i18n('Pronadjite svoju delatnost u NACE listi')}</div>
                                <div className="h-32" />
                            </>
                        ) : (
                            <>
                                <div className="vtk-nace-table-header">
                                    <span className="w-4 mr-2" /><span className="w-1/5 ml-2">{i18n('SKD')}</span><span className="w-4/5">{i18n('Opis djelatnosti')}</span>
                                </div>
                                <div className="vtk-nace-table-body">
                                {sellerNaceClassifications.map((nace, i) => (
                                    <div key={nace.id} className="vtk-nace-table-row font-semibold">
                                        <div className="vtk-nace-table-row-segment flex flex-row md:w-1/5 w-full">
                                            <div className="w-4">{i + 1 + '.'}</div>
                                            <div className="vtk-nace-table-field ml-2 w-full">{nace.id}</div>
                                        </div>
                                        <div className="vtk-nace-table-row-segment w-full md:w-4/5 flex">
                                            <span className="vtk-nace-table-field mx-2 md:ml-0 ml-6 truncate w-full">{nace.opis}</span>
                                            <div className="button ml-2" onClick={
                                                !NACEKlasifikacije || NACEKlasifikacije.length === 0 ? null :
                                                () => Actions.showNACEModal(
                                                'Pronadjite djelatnosti prema NACE klasifikaciji',
                                                NACEKlasifikacije,
                                                sellerNaceClassifications,
                                                (nace) => setSellerNaceClassifications(nace),
                                                false
                                            )}>
                                                <Icon icon="edit" />
                                            </div>
                                            <div className="button mx-2" onClick={() => removeNaceClassification(nace)}>
                                                <Icon icon="trash" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {isServiceProvider && (
                    <>
                        <div className="vtk-seller-section-header">
                            {i18n('Usluge koje pruža vaša kompanija')}
                        </div>
                        <div className="vtk-usluge-table-body">
                            {_.map(usluge, u => (
                                <div key={u.index} className="vtk-usluge-table-row flex flex-row w-full grid grid-cols-12 gap-2 mb-2">
                                    <div className="flex flex-col lg:col-span-4 xs:col-span-12">
                                        <div className="vtk-seller-field-label">{i18n('Naziv usluge')}</div>
                                        <TextField
                                            className={'vtk-seller-field-input'}
                                            maxLength="255"
                                            value={u.naziv}
                                            onChange={ e => handleChangeUslugaNaziv(e.target.value, u.index)}
                                        />
                                    </div>
                                    <div className="flex flex-row lg:col-span-8 xs:col-span-12 mt-9 ml-auto">
                                        <UploadImageButton
                                            className="w-10 h-10 mr-2 uppercase px-2 py-2"
                                            onOpenFile={ imageData => onSelectImage(imageData, u, 'photo_1')}
                                            cropRange={SellerServiceImageOpts}
                                            cropRatio={1}
                                            noCrop
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
                                            noCrop
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
                                            noCrop
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
                                            noCrop
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
                                        <div className="vtk-seller-field-label">{i18n('Opis usluge')}</div>
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
                )}
                </>)}
				<div className="flex flex-row flex-end mt-10 vtk-submit-buttons">
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
export default SellerNACEClassificationForm;
