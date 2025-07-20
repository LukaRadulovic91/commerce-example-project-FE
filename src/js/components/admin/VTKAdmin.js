import _ from 'lodash';

import Hooks from '@/hooks';

import Persistence from '@/modules/Persistence';
import Content from '@ui/Content';
import { useState, useEffect, useRef } from 'react';
import Actions from '@/actions';
import { ajaxGET } from '@/modules/ajax';

import DataGrid, {
    Column,
    Grouping,
    GroupPanel,
    SearchPanel,
    FilterRow,
    FilterPanel,
    FilterBuilder,
    FilterBuilderPopup,
    LoadPanel,
    Export
  } from 'devextreme-react/data-grid';

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';

const VTKAdmin = () => {
	const i18n = Hooks.useI18n();
	Hooks.useTitle(i18n('Digitalna Komora'));
    const [sellers, setSellers] = useState([]);
    const dataGrid = useRef(null);
    document.body.classList.add('dx-viewport');

    const filterBuilderPopupPosition = {
        of: window,
        at: 'top',
        my: 'top',
        offset: { y: 10 }
      };

    useEffect(() => {
        dataGrid.current.instance.beginCustomLoading(i18n('Podaci se učitavaju...'));
        ajaxGET({
            api: '/vtk-admin/sellers',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    setSellers(response.data);
                } else {
                }  
            },
            error: (status, errorMessage) => {
				if (status === 401) {
                    Actions.cleanupLogin(true);
                    window.location = '/login';
                }
			},
            finally: () => {
                dataGrid.current.instance.endCustomLoading();
            },
            infiniteRetries: false,
        });
    }, []);

    const carinskeTarifeValue = (rowData) => {
        const carinske_tarife = rowData.carinske_tarife;
        let value = '';
        for (let c of carinske_tarife) {
            value = value + c.hs.id + '(' + c.godisnja_kolicina +'); ';
        }
        return(value);
    }

    const uvozneCarinskeTarifeValue = (rowData) => {
        const carinske_tarife = rowData.carinske_tarife_uvoz;
        let value = '';
        for (let c of carinske_tarife) {
            value = value + c.hs.id + '(' + c.godisnja_kolicina +'); ';
        }
        return(value);
    }

    const izvozneCarinskeTarifeValue = (rowData) => {
        const carinske_tarife = rowData.carinske_tarife_izvoz;
        let value = '';
        for (let c of carinske_tarife) {
            value = value + c.hs.id + '(' + c.godisnja_kolicina +'); ';
        }
        return(value);
    }

    const naceValue = (rowData) => {
        const nace = rowData.nace_klasifikacije;
        let value = '';
        for (let c of nace) {
            value = value + c.nace.id + '; ';
        }
        return(value);
    }

    const partneriValue = (rowData) => {
        const partneri = rowData.partner_tipovi;
        let value = '';
        for (let p of partneri) {
            value = value + p.opis + '; ';
        }
        return(value);
    }

    const uslugeValue = (rowData) => {
        const usluge = rowData.usluge;
        let value = '';
        for (let u of usluge) {
            value = value + u.naziv + '; ';
        }
        return(value);
    }
    const proizvodiValue = (rowData) => {
        const proizvodi = rowData.kljucni_proizvodi;
        let value = '';

        for (let u of proizvodi) {
            value = value + u.hs?.id + '; ';
        }
        return(value);
    }

    const mjestoNazivValue = (rowData) => {
        const mjesto = rowData.mjesto;
        return(mjesto?.naziv);
    }
    const mjestoOpstinaValue = (rowData) => {
        const mjesto = rowData.mjesto;
        return(mjesto?.opstina?.naziv);
    }
    const mjestoEntitetValue = (rowData) => {
        const mjesto = rowData.mjesto;
        return(mjesto?.opstina?.entitet?.naziv);
    }

    const filterPanelTexts = {
        clearFilter: "Očistite filtere",
        createFilter: "Napravite filtere",
        filterEnabledHint: "Filteri omogućeni",
    }
    
    const groupingTexts = {
        groupByThisColumn: "Prevucite zaglavlje kolone ovdje da bi Ste grupisali podatke po njoj",
        groupContinuesMessage: "Grupa se nastavlja na sledćoj strani",
        groupContinuedMessage: "Grupa nastavljena sa prethodne strane",
        ungroup: "Uklonite grupisanje",
        ungroupAll: "Uklonite sva grupisanja"
    }

    const operationDescriptionTexts = {
        between: "Između",
        contains: "Sadrži",
        notContains: "Ne sadrži",
        endsWith: "Završava sa",
        equal: "Jednako",
        notEqual: "Nije jednako",
        greaterThan: "Više od",
        greaterThanOrEqual: "Više ili jednako",
        lessThan: "Manje od",
        lessThanOrEqual: "Manje ili jednako",
        startsWith: "Počinje sa",
    }

    const filterOperationDescriptionTexts = {
        between: "Između",
        contains: "Sadrži",
        notContains: "Ne sadrži",
        endsWith: "Završava sa",
        equal: "Jednako",
        notEqual: "Nije jednako",
        greaterThan: "Više od",
        greaterThanOrEqual: "Više ili jednako",
        lessThan: "Manje od",
        lessThanOrEqual: "Manje ili jednako",
        startsWith: "Počinje sa",
        isBlank: "Je prazno",
        isNotBlank: "Nije prazno",
        isAnyOf: "Neki je od",
        isNoneOf: "Nije nijedan od",
    }


    const filterGroupOperationDescriptionTexts = {
        and: "I",
        notAnd: "Ne i",
        notOr: "Ne ili",
        or: "Ili",
    }


	return (
        <>
            <Content className="content-home-bg-image">
                <DataGrid
                    ref={dataGrid}
                    focusedRowEnabled={true}
                    className="mx-10 my-10"
                    dataSource={sellers}
                    allowColumnReordering={true}
                    columnAutoWidth={true}
                    showBorders={true}
                    rowAlternationEnabled={true}
                    falseText={"Ne"}
                    trueText={"Da"}
                    keyExpr={'id'}
                >
                    <LoadPanel 
                        enabled 
                        text="Podaci se učitavaju..."
                        />
                    <SearchPanel 
                        visible={true} />
                    <Grouping 
                        texts={groupingTexts}
                        contextMenuEnabled={true} />
                    <GroupPanel
                        emptyPanelText='Prevucite zaglavlje kolone ovdje da bi Ste grupisali podatke po njoj'
                        visible={true} />
                    <FilterRow 
                        applyFilterText='Primjenite filter'
                        betweenEndText='kraj'
                        betweenStartText='početak'
                        falseText={"Ne"}
                        trueText={"Da"}
                        showAllText='(sve)'
                        operationDescriptions={operationDescriptionTexts}
                        visible={true} />
                    <FilterPanel visible={true} texts={filterPanelTexts}  />
                    <FilterBuilder groupOperationDescriptions={filterGroupOperationDescriptionTexts} filterOperationDescriptions={filterOperationDescriptionTexts} />
                    <FilterBuilderPopup position={filterBuilderPopupPosition} title={'Napravite filter'} />
                    <Column 
                        dataField="id"
                        width={60}
                        />
                    <Column 
                        dataField="datum_zadnje_posjete"
                        dataType="datetime"
                        format="M/d/yyyy, HH:mm"
                        width={160}
                        />
                    <Column 
                        dataField="naziv"
                        width={300}
                        />
                    <Column 
                        dataField="jib"
                        width={130}
                        />
                    <Column
                        caption={'Pošt. br.'}
                        dataField="postanski_broj"
                        width={70}
                        />
                    <Column 
                        dataField="adresa"
                        width={240}
                        />

                    <Column
                        caption="Mjesto"
                        calculateCellValue={mjestoNazivValue}
                        // dataField={mjestoNazivValue}
                        name="mjesto"
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={160}
                        />
                    <Column
                        caption="Opština"
                        calculateCellValue={mjestoOpstinaValue}
                        // dataField={mjestoOpstinaValue}
                        name="opstina"
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={160}
                        />
                    <Column
                        caption="Entitet"
                        calculateCellValue={mjestoEntitetValue}
                        // dataField={mjestoOpstinaValue}
                        name="entitet"
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={150}
                        />

                    <Column 
                        dataField="odgovorno_lice"
                        width={240}
                        />
                    <Column 
                        dataField="email"
                        width={200}
                        />
                    <Column 
                        dataField="website"
                        width={200}
                        />
                    <Column 
                        dataField="fax"
                        width={160}
                        />
                    <Column 
                        dataField="telefon"
                        width={200}
                        />
                    <Column 
                        dataField="registrant_pozicija"
                        width={160}
                        />
                    <Column 
                        dataField="registrant_prefix"
                        width={120}
                        />
                    <Column 
                        dataField="registrant_ime_i_prezime"
                        width={180}
                        />
                    <Column 
                        dataField="registrant_email"
                        width={200}
                        />
                    <Column 
                        dataField="registrant_telefon"
                        width={160}
                        />

                    <Column 
                        caption={'Kontakt: pozicija'}
                        dataField="kontakt_osoba_pozicija"
                        width={160}
                        />
                    <Column 
                        caption={'Kontakt: ime'}
                        dataField="kontakt_osoba_ime_i_prezime"
                        width={200}
                        />
                    <Column 
                        caption={'Kontakt: email'}
                        dataField="kontakt_osoba_email"
                        width={160}
                        />
                    <Column 
                        caption={'Kontakt: telefon'}
                        dataField="kontakt_osoba_telefon"
                        width={160}
                        />
                    <Column 
                        dataField="broj_zaposlenih"
                        width={120}
                        />
                    <Column 
                        dataField="godina_osnivanja"
                        width={130}
                        />
                    <Column 
                        caption={'Godišnji prihod'}
                        dataField="godisnji_prihod"
                        width={130}
                        />
                    <Column 
                        caption={'Vrsta djelatnosti'}
                        dataField="vrsta_djelatnosti"
                        width={400}
                        />
                    <Column 
                        caption={'Proizvodna?'}
                        dataField="djelatnost_proizvodna"
                        width={100}
                        />
                    <Column 
                        caption={'Uslužna?'}
                        dataField="djelatnost_usluzna"
                        width={100}
                        />
                    <Column 
                        caption={'White label?'}
                        dataField="white_label"
                        width={100}
                        />
                    <Column 
                        caption={'Aktivnosti kompanije'}
                        dataField="aktivnosti_kompanije"
                        width={400}
                        />
                    <Column 
                        caption={'Domaće tržište?'}
                        dataField="trzisna_orijentacija_domace"
                        width={140}
                        />
                    <Column 
                        caption={'Izvozno orjentisan?'}
                        dataField="trzisna_orijentacija_izvoz"
                        width={140}
                        />
                    <Column 
                        caption={'Uvozno orjentisan?'}
                        dataField="trzisna_orijentacija_uvoz"
                        width={140}
                        />
                    <Column 
                        caption={'Glavna tržišta'}
                        dataField="glavna_trzista"
                        width={400}
                        />
                    <Column 
                        caption={'Iskorištenost proizvodnog kapaciteta (%)'}
                        dataField="iskoristenost_proizvodnog_kapaciteta"
                        width={280}
                        />
                    <Column
                        caption="NACE Klasifikacije"
                        calculateCellValue={naceValue}
                        // dataField={naceValue}
                        name="nace"
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />
                    <Column
                        caption="Preferirani partneri"
                        calculateCellValue={partneriValue}
                        name="partneri"
                        // dataField={partneriValue}
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />
                    <Column
                        caption="Carinske tarife (količina)"
                        calculateCellValue={carinskeTarifeValue}
                        name="carinsketarife"
                        // dataField={carinskeTarifeValue}
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />
                    <Column
                        caption="Uvozne Carinske tarife (količina)"
                        calculateCellValue={uvozneCarinskeTarifeValue}
                        name="uvoznecarinsketarife"
                        // dataField={uvozneCarinskeTarifeValue}
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />
                    <Column
                        caption="Izvozne Carinske tarife (količina)"
                        calculateCellValue={izvozneCarinskeTarifeValue}
                        name="izvoznecarinsketarife"
                        // dataField={izvozneCarinskeTarifeValue}
                        allowSorting={true}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />

                    <Column
                        caption="Uvoze usluga"
                        dataField="uvoz_usluge"
                        width={300}
                        />

                    <Column
                        caption="Izvozne usluga"
                        dataField="izvoz_usluge"
                        width={300}
                        />

                    <Column
                        caption="Proizvodi/usluge"
                        calculateCellValue={uslugeValue}
                        name="usluge"
                        // dataField={uslugeValue}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />

                    <Column
                        caption="Ključni proizvodi"
                        calculateCellValue={proizvodiValue}
                        name="proizvodi"
                        // dataField={proizvodiValue}
                        allowSearch={true}
                        allowFiltering={true}
                        allowGrouping={true}
                        width={300}
                        />
                    <Column 
                        dataField="certifikati_dozvole_i_licence"
                        width={400}
                        />
                    <Column 
                        dataField="reference"
                        width={400}
                        />
                    <Column
                        caption="Link PDF katalog"
                        dataField="link_katalog_pdf"
                        width={300}
                        />
                    <Column
                        caption="Link promo video"
                        dataField="link_promo_video"
                        width={300}
                        />

                    <Column
                        caption="Kompetitivne prednosti?"
                        dataField="kompetitivne_prednosti"
                        width={300}
                        />
                    <Column
                        caption="Kompetitivne prednosti opis"
                        dataField="kompetitivne_prednosti_opis"
                        width={300}
                        />
                    <Column
                        caption="Investicije u istraživanje"
                        dataField="investicije_u_istrazivanje"
                        width={300}
                        />
                    <Column
                        caption="Investicije u istraživanje opis"
                        dataField="investicije_u_istrazivanje_opis"
                        width={300}
                        />
                    <Column
                        dataField="investicije_u_proizvodnju"
                        width={300}
                        />
                    <Column
                        dataField="investicije_u_proizvodnju_opis"
                        width={300}
                        />

                    <Export enabled={true} />
                </DataGrid>
                
            </Content>
        </>
	);
};

export default VTKAdmin;
