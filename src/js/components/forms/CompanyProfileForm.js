import _ from 'lodash';
import { useState, useEffect } from 'react';

import Actions from '@/actions';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link } from 'react-router-dom';
import ReduxState from '@/modules/ReduxState';

import TextField from '@ui/TextField';
import Form from '@ui/Form';
import Dropdown from '@ui/Dropdown';

const CompanyProfileForm = props => {
	const i18n = Hooks.useI18n();
    const [submitting, setSubmitting] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [existingUserNaziv, setExistingUserNaziv] = useState(null);
    const [existingUserJib, setExistingUserJib] = useState(null);
    const [seller, setSeller] = useState(null);
    const userData = Hooks.useUser();

    useEffect(() => {
        ajaxGET({
            api: '/sellers/' + userData.id,
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let seller = response.data;
                    setSeller(seller);
                    setIsExistingUser(true);
                    setExistingUserJib(seller.jib);
                    setExistingUserNaziv(seller.naziv);
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

	const handleSubmit = e => {
		e.preventDefault();
		if (submitting) {
			return;
        }
        
        const sellerData = seller;
        
		setSubmitting(true);
		ajaxPOST({
			api: '/sellers/' + userData.id + '/save',
			data: sellerData,
            auth: {
                token: Persistence.get('user_token'),
            },
			infiniteRetries: false,
			success: response => {
				if (response.success && response.message == "OK") {
                    Actions.addModal('', i18n('Uspješno ste ažurirali podatke'));
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

	return (
		<div className="company-profile-form-container">
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
				className={'form-vertical mx-5'}
			>
                <div className="company-profile-section-header">
                    {i18n('Osnovni Podaci')}
                </div>
                <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                    <div className="flex flex-col lg:col-span-10 xs:col-span-12">
                        <div className="company-profile-field-label">{i18n('Naziv privrednog subjekta*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            inputClassName={'uppercase'}
                            maxLength="254"
                            required
                            disabled={isExistingUser && existingUserNaziv !== null && existingUserNaziv !== ''}
                            value={seller?.naziv}
                            onChange={e => setSeller({...seller, 
                                naziv: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                        <div className="company-profile-field-label">{i18n('JIB / ID broj*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            disabled={isExistingUser && existingUserJib !== null && existingUserJib !== ''}
                            value={seller?.jib}
                            onChange={e => setSeller({...seller, 
                                jib: e.target.value,
                            })}
                        />
                    </div>
                </div>
                <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                    <div className="flex flex-col lg:col-span-8  xs:col-span-12">
                        <div className="company-profile-field-label">{i18n('Adresa*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            value={seller?.adresa}
                            onChange={e => setSeller({...seller, 
                                adresa: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                        <div className="company-profile-field-label">{i18n('Poštanski broj*')}</div>
                        <TextField
                            type="number"
                            className={'company-profile-field-input'}
                            maxLength="5"
                            required
                            value={seller?.postanski_broj}
                            onChange={e => setSeller({...seller, 
                                postanski_broj: e.target.value,
                            })}
                        />
                    </div>

                    <div className="flex flex-col lg:col-span-2 xs:col-span-12">
                        <div className="company-profile-field-label">{i18n('Mjesto*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            value={seller?.grad}
                            onChange={e => setSeller({...seller, 
                                grad: e.target.value,
                            })}
                        />
                    </div>
                </div>
                <div className="company-profile-section-header">
                    {i18n('Opis djelatnosti')}
                </div>
                <div className="w-full">
                    <div className="company-profile-field-label">{i18n('Opis djelatnosti*')}</div>
                    <textarea
                        className="company-profile-field-input h-28 w-full"
                        maxLength="1000"
                        required
                        value={seller?.vrsta_djelatnosti ? seller?.vrsta_djelatnosti : ''}
                        onChange={e => setSeller({...seller, 
                            vrsta_djelatnosti: e.target.value,
                        })}
                    />
                </div>

                <div className="company-profile-section-header">
                    {i18n('Dodatni Podaci')}
                </div>
                <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                    <div className="flex flex-col lg:col-span-2 xs:col-span-4">
                        <div className="company-profile-field-label">{i18n('Godina osnivanja')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength={4}
                            type="number"
                            min={1000}
                            max={2100}
                            value={seller?.godina_osnivanja}
                            onChange={e => setSeller({...seller, 
                                godina_osnivanja: e.target.value,
                            })}
                        />
                    </div>

                    <div className="flex flex-col lg:col-span-2 xs:col-span-4">
                        <div className="company-profile-field-label">{i18n('Broj zaposlenih')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.broj_zaposlenih}
                            onChange={e => setSeller({...seller, 
                                broj_zaposlenih: e.target.value,
                            })}
                        />
                    </div>

                    <div className="flex flex-col lg:col-span-2 xs:col-span-4">
                        <div className="company-profile-field-label">{i18n('Godišnji prihod u EUR')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.godisnji_prihod}
                            onChange={e => setSeller({...seller, 
                                godisnji_prihod: e.target.value,
                            })}
                        />
                    </div>
                </div>

                <div className="company-profile-section-header">
                    {i18n('Kontakt informacije')}
                </div>
                <div className="flex flex-row flex-grow w-full grid grid-cols-12 gap-8 ">
                    <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Odgovorno lice*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            value={seller?.odgovorno_lice}
                            onChange={e => setSeller({...seller, 
                                odgovorno_lice: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Pozicija')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.odgovorno_lice_pozicija}
                            onChange={e => setSeller({...seller, 
                                odgovorno_lice_pozicija: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-5 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Jezik za komunikaciju')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.jezik}
                            onChange={e => setSeller({...seller, 
                                jezik: e.target.value,
                            })}
                        />
                    </div>
                </div>
                <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                    <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Kontakt telefoni*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            value={seller?.telefon}
                            onChange={e => setSeller({...seller, 
                                telefon: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Email*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            type="email"
                            value={seller?.email}
                            onChange={e => setSeller({...seller, 
                                email: e.target.value,
                            })}
                        />
                    </div>

                    <div className="flex flex-col lg:col-span-5 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Web sajt')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.website}
                            onChange={e => setSeller({...seller, 
                                website: e.target.value,
                            })}
                        />
                    </div>
                </div>

                <div className="company-profile-section-header">
                    {i18n('Informacije o proizvodima i uslugama')}
                </div>
                <div className="w-full">
                    <div className="company-profile-field-label">{i18n('Asortiman*')}</div>
                    <textarea
                        className="company-profile-field-input h-28 w-full"
                        maxLength="1000"
                        required
                        value={seller?.asortiman ? seller?.asortiman : ''}
                        onChange={e => setSeller({...seller, 
                            asortiman: e.target.value,
                        })}
                    />
                </div>
                <div className="w-full">
                    <div className="company-profile-field-label">{i18n('Ključni proizvodi*')}</div>
                    <textarea
                        className="company-profile-field-input h-28 w-full"
                        maxLength="1000"
                        required
                        value={seller?.kljucni_proizvodi ? seller?.kljucni_proizvodi : ''}
                        onChange={e => setSeller({...seller, 
                            kljucni_proizvodi: e.target.value,
                        })}
                    />
                </div>
                <div className="w-full">
                    <div className="company-profile-field-label">{i18n('Kapacitet proizvodnje')}</div>
                    <TextField
                        className={'company-profile-field-input'}
                        maxLength="254"
                        value={seller?.kapacitet_proizvodnje}
                        onChange={e => setSeller({...seller, 
                            kapacitet_proizvodnje: e.target.value,
                        })}
                    />
                </div>
                <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                    <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Izvozno orjentisan*')}</div>
                        <Dropdown
                            className="company-profile-field-input-dropdown"
							label={i18n('Izaberite DA/NE')}
                            onChange={e => setSeller({...seller, 
                                izvozno_orjentisan: e,
                            })}
                            required
                            value={seller?.izvozno_orjentisan}
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
                        <div className="company-profile-field-label">{i18n('Glavna izvozna tržišta')}{seller?.izvozno_orjentisan ? '*' : ''}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required={seller?.izvozno_orjentisan}
                            value={seller?.glavna_trzista}
                            onChange={e => setSeller({...seller, 
                                glavna_trzista: e.target.value,
                            })}
                        />
                    </div>
                </div>
                <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                    <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('White label proizvođač')}</div>
                        <Dropdown
                            className="company-profile-field-input-dropdown"
							label={i18n('Izaberite DA/NE')}
                            onChange={e => setSeller({...seller, 
                                white_label: e,
                            })}
                            value={seller?.white_label}
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
                        <div className="company-profile-field-label">{i18n('Reference')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.reference}
                            onChange={e => setSeller({...seller, 
                                reference: e.target.value,
                            })}
                        />
                    </div>
                </div>
                <div className="flex flex-row w-full grid grid-cols-12 gap-8">
                    <div className="flex flex-col lg:col-span-4 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Odgovorno lice za kontakt o proizvodima i uslugama*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            value={seller?.kontakt_osoba_ime}
                            onChange={e => setSeller({...seller, 
                                kontakt_osoba_ime: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-2 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Pozicija')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            value={seller?.kontakt_osoba_pozicija}
                            onChange={e => setSeller({...seller, 
                                kontakt_osoba_pozicija: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Kontakt telefoni*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            value={seller?.kontakt_osoba_telefon}
                            onChange={e => setSeller({...seller, 
                                kontakt_osoba_telefon: e.target.value,
                            })}
                        />
                    </div>
                    <div className="flex flex-col lg:col-span-3 xs:col-span-6">
                        <div className="company-profile-field-label">{i18n('Email*')}</div>
                        <TextField
                            className={'company-profile-field-input'}
                            maxLength="254"
                            required
                            type="email"
                            value={seller?.kontakt_osoba_email}
                            onChange={e => setSeller({...seller, 
                                kontakt_osoba_email: e.target.value,
                            })}
                        />
                    </div>
                </div>

                <div className="company-profile-section-header">
                    {i18n('Informacije o sertifikacijama, dozvolama i licencama')}
                </div>
                <div className="w-full">
                    <div className="company-profile-field-label">{i18n('Sertifikati, dozvole i licence')}</div>
                    <textarea
                        className="company-profile-field-input h-28 w-full"
                        maxLength="1000"
                        value={seller?.certifikati ? seller?.certifikati : ''}
                        onChange={e => setSeller({...seller, 
                            certifikati: e.target.value,
                        })}
                    />
                </div>


				<div className="flex flex-row mt-20">
					<Link to="/signup" className="button signup-button mr-auto">
						{i18n('Odustanite')}
					</Link>
					<button className="button login-button ml-auto" type="submit">
						{i18n('Sačuvajte podatke')}
					</button>
				</div>
			</Form>
		</div>
	);
};
export default CompanyProfileForm;
