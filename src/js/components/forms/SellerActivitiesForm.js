import _ from 'lodash';
import { useState, useEffect } from 'react';
import ReduxState from '@/modules/ReduxState';

import Actions from '@/actions';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link, useHistory} from 'react-router-dom';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import Loading from '@ui/Loading';
import Dropdown from '@ui/Dropdown';

const SellerActivitiesForm = props => {
	const i18n = Hooks.useI18n();
    const [submitting, setSubmitting] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activitiesInfo, setActivitiesInfo] = useState(null);
    const history = useHistory();
    const userData = Hooks.useUser();

    useEffect(() => {
        ajaxGET({
            api: '/sellers/' + userData.id + '/djelatnost-kompanije',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let activitiesInfo = response.data;
                    setActivitiesInfo(activitiesInfo);
                } else {
                }  
            },
            error: (status, errorMessage) => {
				if (status === 401) {
                    handleError(status, errorMessage)
                }
			},
            finally: () => {
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
        
        const sellerData = activitiesInfo;
        if (sellerData.id) {
            delete sellerData.id;
        }
		setSubmitting(true);
		ajaxPOST({
			api: '/sellers/' + userData.id + '/djelatnost-kompanije',
			data: sellerData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    Persistence.set('vtk_form_step_filled', 2);
                    Actions.setUser({...userData, vtk_forma_korak: 2});
                    history.push("/vtk_form/nace");
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

    }, []);

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
                        {i18n('Vrsta djelatnosti')}
                    </div>
                    <div className="flex flex-col flex-grow w-full">
                        <div className="w-full flex flex-col">
                            <div className="vtk-seller-field-label">{i18n('Molimo opišite djelatnosti kompanije*')}</div>
                            <textarea
                                className="vtk-seller-field-input attention-border h-28 w-full"
                                maxLength="8192"
                                required
                                value={activitiesInfo?.vrsta_djelatnosti ? activitiesInfo?.vrsta_djelatnosti : ''}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    vrsta_djelatnosti: e.target.value,
                                })}
                            />
                        </div>
                        <div className="w-full flex flex-col">
                            <div className="vtk-seller-field-label">{i18n('Kratak opis aktivnosti kompanije*')}</div>
                            <textarea
                                className="vtk-seller-field-input attention-border h-28 w-full"
                                maxLength="8192"
                                required
                                value={activitiesInfo?.aktivnosti_kompanije ? activitiesInfo?.aktivnosti_kompanije : ''}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    aktivnosti_kompanije: e.target.value,
                                })}
                            />
                        </div>
                    </div>
                    <div className="vtk-seller-section-header">
                        {i18n('Informacije o sertifikacijama, dozvolama i licencama')}
                    </div>
                    <div className="w-full">
                        <div className="vtk-seller-field-label">{i18n('Sertifikati, dozvole i licence')}</div>
                        <textarea
                            className="vtk-seller-field-input h-28 w-full"
                            maxLength="8192"
                            value={activitiesInfo?.certifikati_dozvole_i_licence ? activitiesInfo?.certifikati_dozvole_i_licence : ''}
                            onChange={e => setActivitiesInfo({...activitiesInfo, 
                                certifikati_dozvole_i_licence: e.target.value,
                            })}
                        />
                    </div>
                    <div className="vtk-seller-section-header">
                        {i18n('Proizvodni kapaciteti')}
                    </div>
                    <div className="w-full">
                        <div className="vtk-seller-field-label">{i18n('Iskorištenost proizvodnog kapaciteta u % *')}</div>
                        <TextField
                            className={'vtk-seller-field-input required w-1/12'}
                            type="number"
                            required
                            min={0}
                            max={100}
                            maxLength={3}
                            value={activitiesInfo?.iskoristenost_proizvodnog_kapaciteta}
                            onChange={e => setActivitiesInfo({...activitiesInfo, 
                                iskoristenost_proizvodnog_kapaciteta: e.target.value,
                            })}
                        />
                    </div>

                    <div className="vtk-seller-section-header">
                        {i18n('Investicije')}
                    </div>
                    <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                        <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                            <div className="vtk-seller-field-label">{i18n('Da li ste u zadnje dvije godine realizovali investicije u proizvodnju?')}</div>
                            <Dropdown
                                className="vtk-seller-field-input-dropdown"
                                label={i18n('Izaberite Da ili Ne')}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    investicije_u_proizvodnju: e,
                                })}
                                value={activitiesInfo?.investicije_u_proizvodnju}
                            >
                                <Dropdown.Item key={'da'} value={true} className="">
                                    {i18n('Da')}
                                </Dropdown.Item>
                                <Dropdown.Item key={'ne'} value={false} className="">
                                    {i18n('Ne')}
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                        <div className="flex flex-col col-span-12">
                            <div className="vtk-seller-field-label">{i18n('O kakvom vidu investicija je riječ')}{activitiesInfo?.investicije_u_proizvodnju ? '*' : ''}</div>
                            <textarea
                                className={'vtk-seller-field-input h-28 w-full' + (activitiesInfo?.investicije_u_proizvodnju ? ' attention-border' : '')}
                                maxLength="8192"
                                required={activitiesInfo?.investicije_u_proizvodnju}
                                value={activitiesInfo?.investicije_u_proizvodnju_opis ? activitiesInfo?.investicije_u_proizvodnju_opis : ''}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    investicije_u_proizvodnju_opis: e.target.value,
                                })}
                            />
                        </div>
                        <div className="flex flex-col lg:col-span-12 xs:col-span-6">
                            <div className="vtk-seller-field-label">{i18n('Da li ulažete u istraživanje i razvoj u Vašoj kompaniji?')}</div>
                            <Dropdown
                                className="vtk-seller-field-input-dropdown"
                                label={i18n('Izaberite Da ili Ne')}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    investicije_u_istrazivanje: e,
                                })}
                                value={activitiesInfo?.investicije_u_istrazivanje}
                            >
                                <Dropdown.Item key={'da'} value={true} className="">
                                    {i18n('Da')}
                                </Dropdown.Item>
                                <Dropdown.Item key={'ne'} value={false} className="">
                                    {i18n('Ne')}
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                        <div className="flex flex-col col-span-12">
                            <div className="vtk-seller-field-label">{i18n('Opišite ulaganja u istraživanje u Vašoj kompaniji')}{activitiesInfo?.investicije_u_istrazivanje ? '*' : ''}</div>
                            <textarea
                                className={'vtk-seller-field-input h-28 w-full' + (activitiesInfo?.investicije_u_istrazivanje ? ' attention-border' : '')}
                                maxLength="8192"
                                required={activitiesInfo?.investicije_u_istrazivanje}
                                value={activitiesInfo?.investicije_u_istrazivanje_opis ? activitiesInfo?.investicije_u_istrazivanje_opis : ''}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    investicije_u_istrazivanje_opis: e.target.value,
                                })}
                            />
                        </div>
                    </div>


                    <div className="vtk-seller-section-header">
                        {i18n('Kompetitivne prednosti')}
                    </div>
                    <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                        <div className="flex flex-col col-span-12">
                            <div className="vtk-seller-field-label">{i18n('Da li vaša kompanija posjeduje određene prednosti i/ili specifične proizvode/usluge u odnosu na konkurenciju unutar poslovnog sektora?')}</div>
                            <Dropdown
                                className="vtk-seller-field-input-dropdown w-4/5 sm:w-2/5 lg:w-1/5"
                                label={i18n('Izaberite Da ili Ne')}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    kompetitivne_prednosti: e,
                                })}
                                value={activitiesInfo?.kompetitivne_prednosti}
                            >
                                <Dropdown.Item key={'da'} value={true} className="">
                                    {i18n('Da')}
                                </Dropdown.Item>
                                <Dropdown.Item key={'ne'} value={false} className="">
                                    {i18n('Ne')}
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                        <div className="flex flex-col lg:col-span-9 xs:col-span-12">
                            <div className="vtk-seller-field-label">{i18n('Opis gore navedenih prednosti i/ili specifičnih proizvoda/usluga')}</div>
                            <textarea
                                className="vtk-seller-field-input h-28 w-full"
                                maxLength="8192"
                                value={activitiesInfo?.kompetitivne_prednosti_opis ? activitiesInfo?.kompetitivne_prednosti_opis : ''}
                                onChange={e => setActivitiesInfo({...activitiesInfo, 
                                    kompetitivne_prednosti_opis: e.target.value,
                                })}
                            />
                        </div>
                    </div>

                    <div className="vtk-seller-section-header">
                        {i18n('Reference')}
                    </div>
                    <div className="flex flex-col lg:col-span-9 xs:col-span-12">
                        <div className="vtk-seller-field-label">{i18n('Navedite svoje reference')}</div>
                        <textarea
                            className="vtk-seller-field-input h-28 w-full"
                            maxLength="8192"
                            value={activitiesInfo?.reference ? activitiesInfo?.reference : ''}
                            onChange={e => setActivitiesInfo({...activitiesInfo, 
                                reference: e.target.value,
                            })}
                        />
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
export default SellerActivitiesForm;
