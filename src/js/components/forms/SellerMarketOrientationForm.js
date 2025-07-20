import _ from 'lodash';
import { useState, useEffect } from 'react';

import Actions from '@/actions';
import ReduxState from '@/modules/ReduxState';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link, useHistory } from 'react-router-dom';

import TextField from '@ui/TextField';
import Checkbox from '../ui/Checkbox';
import Dropdown from '@ui/Dropdown';
import Loading from '@ui/Loading';
import MultipleSelect from '@ui/MultipleSelect';
import Form from '@ui/Form';
import Icon from '@ui/Icon';

const SellerMarketOrientationForm = props => {
	const i18n = Hooks.useI18n();
    const history = useHistory();
    const userData = Hooks.useUser();
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isDomestic, setIsDomestic] = useState(false);
    const [isImport, setIsImport] = useState(false);
    const [isExport, setIsExport] = useState(false);
    const [sellerMarketInfo, setSellerMarketInfo] = useState(null);
    const [partneri, setPartneri] = useState([]);
    const [selectedPartneri, setSelectedPartneri] = useState([]);
    const [partneriPlaceholder, setPartneriPlaceholder] = useState('');
    const [HSKlasifikacije, setHSKlasifikacije] = useState();
    const [importHSCodes, setImportHSCodes] = useState([]);
    const [exportHSCodes, setExportHSCodes] = useState([]);

    const removeImportHSCodes = hs => {
        setImportHSCodes(_.filter(importHSCodes, c => c.hs.id !== hs.hs.id));
    }

    const removeExportHSCodes = hs => {
        setExportHSCodes(_.filter(exportHSCodes, c => c.hs.id !== hs.hs.id));
    }

    const setImportHSKolicina = (value, id) => {
        setImportHSCodes((prevHS) => 
            prevHS.map((hs) => {
                return hs.hs.id === id ? {...hs, godisnja_kolicina: value} : hs;
            }));
    }

    const setExportHSKolicina = (value, id) => {
        setExportHSCodes((prevHS) => 
            prevHS.map((hs) => {
                return hs.hs.id === id ? {...hs, godisnja_kolicina: value} : hs;
            }));
    }

    const handleChangePartneri = partneri => {
        setSelectedPartneri(partneri);
        let placeholder = '';
        _.forEach(partneri, (o, i) => (
            placeholder = placeholder.concat(o.opis, i + 1 < partneri.length ? ', ' : '')
        ));
        setPartneriPlaceholder(placeholder);
    }

    useEffect(() => {
        ajaxGET({
            api: '/sellers/' + userData.id + '/trzisna-orijentacija',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let seller = response.data;

                    setIsDomestic(seller.trzisna_orijentacija_domace);
                    setIsImport(seller.trzisna_orijentacija_uvoz);
                    setIsExport(seller.trzisna_orijentacija_izvoz)
                    setImportHSCodes(seller.carinske_tarife_uvoz);
                    setExportHSCodes(seller.carinske_tarife_izvoz);
                    handleChangePartneri(seller.partner_tipovi);

                    setSellerMarketInfo(seller);
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
        ajaxGET({
            api: '/partner-tip',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let partneri = response.data;
                    setPartneri(partneri);
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
        let importAmmountMissing = false;
        let exportAmmountMissing = false;
        let marketData = {};

        let importHsToSubmit = [];
        for (let hsc of importHSCodes) {
            delete hsc.hs.children
            if (hsc.godisnja_kolicina === 0 || hsc.godisnja_kolicina === '0') {
                importAmmountMissing = true;
            }
            importHsToSubmit.push(hsc)
        }
        marketData.carinske_tarife_uvoz = importHsToSubmit;
        
        let exportHsToSubmit = [];
        for (let hsc of exportHSCodes) {
            delete hsc.hs.children
            if (hsc.godisnja_kolicina === 0 || hsc.godisnja_kolicina === '0') {
                exportAmmountMissing = true;
            }
            exportHsToSubmit.push(hsc)
        }
        marketData.carinske_tarife_izvoz = exportHsToSubmit;

        marketData.uvoz_usluge = sellerMarketInfo.uvoz_usluge;
        marketData.izvoz_usluge = sellerMarketInfo.izvoz_usluge;
        
        marketData.trzisna_orijentacija_domace = isDomestic !== null ? isDomestic : false;
        marketData.trzisna_orijentacija_izvoz = isExport !== null ? isExport : false;
        marketData.trzisna_orijentacija_uvoz = isImport !== null ? isImport : false;

        if (marketData.trzisna_orijentacija_domace === false && marketData.trzisna_orijentacija_izvoz === false && marketData.trzisna_orijentacija_uvoz === false) {
            Actions.addModal('Obavezno polje', 'Molimo odaberite najmanje jednu tržišnu orjentaciju.');
            return;
        }

        if (marketData.trzisna_orijentacija_uvoz && marketData.uvoz_usluge === '' && (!marketData.carinske_tarife_uvoz || marketData.carinske_tarife_uvoz.length < 1 )) {
            Actions.addModal('Obavezno polje', 'Molimo dodajte najmanje jedan proizvod koji uvozite');
            return;
        }

        if (marketData.trzisna_orijentacija_izvoz && marketData.izvoz_usluge === '' && (!marketData.carinske_tarife_izvoz || marketData.carinske_tarife_izvoz.length < 1 )) {
            Actions.addModal('Obavezno polje', 'Molimo dodajte najmanje jedan proizvod koji izvozite');
            return;
        }

        marketData.white_label = sellerMarketInfo.white_label;
        marketData.partner_tipovi = selectedPartneri;

        if (!marketData.partner_tipovi || marketData.partner_tipovi.length < 1) {
            Actions.addModal('Obavezno polje', 'Molimo odaberite najmanje jednu vrstu poslovnog partnera.');
            return;
        }

        if (importAmmountMissing) {
            Actions.addModal('Obavezno polje', 'Molimo dodajte količine za proizvode koje uvozite.');
            return;
        }

        if (exportAmmountMissing) {
            Actions.addModal('Obavezno polje', 'Molimo dodajte količine za proizvode koje izvozite.');
            return;
        }

		setSubmitting(true);
		ajaxPOST({
			api: '/sellers/' + userData.id + '/trzisna-orijentacija',
			data: marketData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    Actions.addModal('', i18n('Uspješno ste ispunili obrazac. Hvala.'));
                    Persistence.set('vtk_form_step_filled', 5);
                    Actions.setUser({...userData, vtk_forma_korak: 5});
                    history.push("/");
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
                <div className="vtk-seller-section-header">
                    {i18n('Izaberite vašu tržišnu orijentaciju')}
                </div>
                <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 mt-4 ">
                    <div className="flex col-span-12 lg:col-span-3">
                        <Checkbox
                            type={'checkbox-first'}
                            checked={isDomestic}
                            onChange={() => setIsDomestic(!isDomestic)}
							label={
								<div className="font-bold uppercase">{i18n('Domaće tržište')}</div>
							}
						/>
                    </div>
                    <div className="flex col-span-12 lg:col-span-3">
                        <Checkbox
                            type={'checkbox-first'}
                            checked={isImport}
                            onChange={() => setIsImport(!isImport)}
							label={
								<div className="font-bold uppercase">{i18n('Uvoz')}</div>
							}
						/>
                    </div>

                    <div className="flex col-span-12 lg:col-span-3">
                        <Checkbox
                            type={'checkbox-first'}
                            checked={isExport}
                            onChange={() => setIsExport(!isExport)}
							label={
								<div className="font-bold uppercase">{i18n('Izvoz')}</div>
							}
						/>
                    </div>
                </div>
                {isImport && (
                    <>
                        <div className="vtk-seller-section-header">
                            {i18n('Uvoz')}
                        </div>
                        {!importHSCodes || (importHSCodes.length <= 0) ? (
                            <>
                                <div className="vtk-seller-find-nace-prompt wide mt-10">{i18n('Izaberite proizvode koje uvozite')}</div>
                                <div 
                                    className={'vtk-seller-find-nace-button mx-auto mt-10' + (!HSKlasifikacije || HSKlasifikacije.length === 0 ? ' disabled' : '')}
                                    disabled={!HSKlasifikacije || HSKlasifikacije.length === 0}
                                    onClick={
                                        () => 
                                        Actions.showHSModal(
                                            'Pronađite carinsku tarifu za svoj proizvod (HS Kod)',
                                            HSKlasifikacije,
                                            importHSCodes,
                                            (hs) => setImportHSCodes(hs),
                                            false
                                        )
                                }>{i18n('Pronađite svoju tarifnu stopu (HS Kod)')}</div>
                                <div className="h-10" />
                            </>
                        ) : (
                            <>
                                <div className="vtk-nace-table-header h-14 md:h-6">
                                    <span className="w-4 mr-2" />
                                    <span className="w-1/5 ml-1">{i18n('Carinska tarifa (HS kod)')}</span>
                                    <span className="w-3/5 mx-2">{i18n('Naziv carinske tarife')}</span>
                                    <span className="flex w-1/5 mr-2">{i18n('Godišnja količina')}</span>
                                </div>
                                <div className="vtk-nace-table-body">
                                {importHSCodes.map((hs, i) => (
                                    <div key={hs.hs.id} className="vtk-nace-table-row font-semibold">
                                        <div className="vtk-nace-table-row-segment flex flex-row md:w-4/5 w-full">
                                            <div className="w-4 mr-2">{i + 1 + '.'}</div>
                                            <div className="vtk-nace-table-field ml-1 w-1/5">{hs.hs.id}</div>
                                            <div className="vtk-nace-table-field mx-2 truncate w-4/5">{i18n(hs.hs.opis).substring(0, 75)}{hs.hs.opis.length > 75 ? '...' : ''}</div>
                                        </div>
                                        <div className="vtk-nace-table-row-segment flex md:w-1/5 md:ml-0 ml-7 w-full">
                                            <TextField
                                                key={hs.hs.id}
                                                className={'vtk-nace-table-textfield attention-border'}
                                                maxLength="254"
                                                type="number"
                                                placeholder={i18n('Godišnja količina')}
                                                required
                                                value={hs.godisnja_kolicina}
                                                onChange={e => setImportHSKolicina(e.target.value, hs.hs.id)}
                                            />
                                            <div className="button ml-2" 
                                                disabled={!HSKlasifikacije || HSKlasifikacije.length === 0}
                                                onClick={() => Actions.showHSModal(
                                                    'Pronadjite carinsku tarifu za svoj proizvod (HS kod)',
                                                    HSKlasifikacije,
                                                    importHSCodes,
                                                    (hs) => setImportHSCodes(hs),
                                                    false
                                                )}
                                            >
                                                <Icon icon="edit" />
                                            </div>
                                            <div className="button mx-2" onClick={() => removeImportHSCodes(hs)}>
                                                <Icon icon="trash" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </>
                        )}
                        <div className="flex flex-col col-span-12">
                            <div className="company-profile-field-label">{i18n('Navedite usluge koje uvozite')}</div>
                            <textarea
                                className={'company-profile-field-input h-28 w-full' + (importHSCodes?.length < 1 ? ' attention-border' : '')}
                                maxLength="8192"
                                required={importHSCodes?.length < 1}
                                value={sellerMarketInfo?.uvoz_usluge ? sellerMarketInfo?.uvoz_usluge : ''}
                                onChange={e => setSellerMarketInfo({...sellerMarketInfo, 
                                    uvoz_usluge: e.target.value,
                                })}
                            />
                        </div>
                    </>
                )}
                {isExport && (
                    <>
                        <div className="vtk-seller-section-header">
                            {i18n('Izvoz')}
                        </div>
                        {!exportHSCodes || (exportHSCodes.length <= 0) ? (
                            <>
                                <div className="vtk-seller-find-nace-prompt wide mt-10">{i18n('Izaberite proizvode koje izvozite')}</div>
                                <div 
                                    className={'vtk-seller-find-nace-button mx-auto mt-10' + (!HSKlasifikacije || HSKlasifikacije.length === 0 ? ' disabled' : '')}
                                    disabled={!HSKlasifikacije || HSKlasifikacije.length === 0}
                                    onClick={
                                        () => 
                                        Actions.showHSModal(
                                            'Pronađite carinsku tarifu za svoj proizvod (HS Kod)',
                                            HSKlasifikacije,
                                            exportHSCodes,
                                            (hs) => setExportHSCodes(hs),
                                            false
                                        )
                                }>{i18n('Pronađite svoju tarifnu stopu (HS Kod)')}</div>
                                <div className="h-10" />
                            </>
                        ) : (
                            <>
                                <div className="vtk-nace-table-header h-14 md:h-6">
                                    <span className="w-4 mr-2" />
                                    <span className="w-1/5 ml-1">{i18n('Carinska tarifa (HS kod)')}</span>
                                    <span className="w-3/5 mx-2">{i18n('Naziv carinske tarife')}</span>
                                    <span className="flex w-1/5 mr-2">{i18n('Godišnja količina')}</span>
                                </div>
                                <div className="vtk-nace-table-body">
                                {exportHSCodes.map((hs, i) => (
                                    <div key={hs.hs.id} className="vtk-nace-table-row font-semibold">
                                        <div className="vtk-nace-table-row-segment flex flex-row md:w-4/5 w-full">
                                            <div className="w-4 mr-2">{i + 1 + '.'}</div>
                                            <div className="vtk-nace-table-field ml-1 w-1/5">{hs.hs.id}</div>
                                            <div className="vtk-nace-table-field mx-2 w-3/5 truncate">{i18n(hs.hs.opis).substring(0, 75)}{hs.hs.opis.length > 75 ? '...' : ''}</div>
                                        </div>
                                        <span className="vtk-nace-table-row-segment flex md:w-1/5 md:ml-0 ml-7 w-full">
                                            <TextField
                                                className={'vtk-nace-table-textfield attention-border'}
                                                maxLength="254"
                                                type="number"
                                                placeholder={i18n('Godišnja količina')}
                                                required
                                                value={hs.godisnja_kolicina}
                                                onChange={e => setExportHSKolicina(e.target.value, hs.hs.id)}
                                            />
                                            <div className="button ml-2" 
                                                disabled={!HSKlasifikacije || HSKlasifikacije.length === 0}
                                                onClick={() => Actions.showHSModal(
                                                    'Pronadjite carinsku tarifu za svoj proizvod (HS kod)',
                                                    HSKlasifikacije,
                                                    exportHSCodes,
                                                    (hs) => setExportHSCodes(hs),
                                                    false
                                                )}
                                            >
                                                <Icon icon="edit" />
                                            </div>
                                            <div className="button mx-2" onClick={() => removeExportHSCodes(hs)}>
                                                <Icon icon="trash" />
                                            </div>
                                        </span>
                                    </div>
                                ))}
                                </div>
                            </>
                        )}

                        <div className="flex flex-col col-span-12">
                            <div className="company-profile-field-label">{i18n('Navedite usluge koje izvozite')}</div>
                            <textarea
                                className={'company-profile-field-input h-28 w-full' + (exportHSCodes?.length < 1 ? ' attention-border' : '')}
                                maxLength="8192"
                                required={exportHSCodes?.length < 1}
                                value={sellerMarketInfo?.izvoz_usluge ? sellerMarketInfo?.izvoz_usluge : ''}
                                onChange={e => setSellerMarketInfo({...sellerMarketInfo, 
                                    izvoz_usluge: e.target.value,
                                })}
                            />
                        </div>
                    </>
                )}
                <div className="vtk-seller-section-header">
                    {i18n('Preferirani poslovni partneri')}
                </div>
                <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                    <div className="flex flex-col lg:col-span-6 xs:col-span-12">
                        <div className="vtk-seller-field-label">{i18n('Izaberite jedan ili vise tipova preferiranih poslovnih partnera')}</div>
                        <MultipleSelect
                            className="company-profile-field-input-dropdown"
							options={partneri}
							optionKey="id"
                            optionName="opis"
                            label={partneriPlaceholder !== '' ? partneriPlaceholder : null}
							onChange={value => handleChangePartneri(value)}
							selectedOptions={selectedPartneri}
							showSelectAll={false}
						/>
                    </div>
                    
                    <div className="flex flex-col lg:col-span-6 xs:col-span-12">
                        <div className="vtk-seller-field-label">{i18n('Zainteresirani smo za proizvodnju pod robnom markom kupca (White Label)')}</div>
                        <Dropdown
                            className="company-profile-field-input-dropdown"
							label={i18n('Izaberite DA/NE')}
                            onChange={e => setSellerMarketInfo({...sellerMarketInfo, 
                                white_label: e,
                            })}
                            value={sellerMarketInfo?.white_label}
						>
                            <Dropdown.Item key={'da'} value={true} className="">
                                {i18n('Da')}
                            </Dropdown.Item>
                            <Dropdown.Item key={'ne'} value={false} className="">
                                {i18n('Ne')}
                            </Dropdown.Item>
						</Dropdown>
                    </div>
                </div>
                </>)}
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
export default SellerMarketOrientationForm;
