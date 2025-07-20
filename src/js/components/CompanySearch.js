import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import { connect } from 'react-redux';
import Icon from '@ui/Icon';
import Dropdown from '@ui/Dropdown';
import MultipleSelect from '@ui/MultipleSelect';
import CompanyList from './ui/CompanyList';
import DKTopBar from './ui/DKTopBar';
import Header from './ui/Header';
import Loading from '@ui/Loading';
import Breadcrumbs from '@ui/Breadcrumbs';
import ReactPaginate from 'react-paginate';
import LoadingBar from 'react-top-loading-bar'

const CompanySearch = () => {
    const { searchString } = useParams();
    const { selectedNace } = useParams();
    const { selectedNaceNivo } = useParams();
	const history = useHistory();
	const i18n = Hooks.useI18n();
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState('naziv');
    const [sortOrder, setSortOrder] = useState('asc');
    const [paginationInfo, setPaginationInfo] = useState({currentPage: 1});
    const [currentPage, setCurrentPage] = useState(1);
    const [NACEKlasifikacije, setNACEKlasifikacije] = useState();
    const [searchTerm, setSearchTerm] = useState(searchString ? searchString : '');
    const [selectedNaceCodes, setSelectedNaceCodes] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [allOpstine, setAllOpstine] = useState([]);
    const [allMjesta, setAllMjesta] = useState([]);
    const [entiteti, setEntiteti] = useState([]);
    const [opstine, setOpstine] = useState([]);
    const [mjesta, setMjesta] = useState([]);
    const [selectedEntiteti, setSelectedEntiteti] = useState([]);
    const [entitetiPlaceholder, setEntitetiPlaceholder] = useState('');
    const [selectedOpstine, setSelectedOpstine] = useState([]);
    const [opstinePlaceholder, setOpstinePlaceholder] = useState('');
    const [selectedMjesta, setSelectedMjesta] = useState([]);
    const [mjestaPlaceholder, setMjestaPlaceholder] = useState('');
    const [whiteLabel, setWhiteLabel] = useState(null);

    const SelectedNace = ({selected}) => {
        return (
            <div className="mt-2">
                <div>{i18n('Izabrani: ')}</div>
                {_.map(selected, (nace, index) => {
                    let opis = i18n(nace.opis).substring(0, 20);
                    opis += nace.opis.length > 20 ? '...' : '';
                    return (
                        <div className="flex flex-row" key={nace.id}>
                            <span className="w-4/5">{nace.id}{' - '}{opis}</span><span onClick={() => removeNACE(nace)} className="w-1/5 text-right cursor-pointer"><Icon icon={'times'} /></span>
                        </div>
                )})}
            </div>
        )
    }

    const removeNACE = nace => {
        let filteredNaceCodes = _.filter(selectedNaceCodes, c => c.id !== nace.id);
        setSelectedNaceCodes(filteredNaceCodes);
    }

    const handleChangeSelectedMjesta = (mjesta) => {
        setSelectedMjesta(mjesta);
        let placeholder = '';
        _.forEach(mjesta, (o, i) => (
            placeholder = placeholder.concat(o.naziv, i + 1 < mjesta.length ? ', ' : '')
        ));
        setMjestaPlaceholder(placeholder);
    }

    const handlePageClick = (data) => {
        setCurrentPage(data.selected + 1);
    };

    const handleChangeSelectedEntiteti = (entiteti) => {
        setSelectedEntiteti(entiteti);
        
        if (entiteti.length > 0) {
            let placeholder = '';
            _.forEach(entiteti, (e, i) => {
                placeholder = placeholder.concat(e.naziv, i + 1 < entiteti.length ? ', ' : '');
            });
            setEntitetiPlaceholder(placeholder);

            let filteredOpstine = _.filter(allOpstine, opstina => _.find(entiteti, entitet => entitet.id === opstina.entitet?.id));
            setOpstine(filteredOpstine);
            handleChangeSelectedOpstine([]);
    
            let filteredMjesta = _.filter(allMjesta, mjesto => _.find(filteredOpstine, opstina => opstina.id === mjesto.opstina?.id));
            setMjesta(filteredMjesta);
            handleChangeSelectedMjesta([]);
        } else {
            setEntitetiPlaceholder('');
            setOpstine(allOpstine);
            handleChangeSelectedOpstine([]);
            setMjesta(allMjesta);
            handleChangeSelectedMjesta([]);
        }
        
    }

    const handleChangeSelectedOpstine = (opstine) => {
        setSelectedOpstine(opstine);

        if (opstine.length > 0) {
            let placeholder = '';
            _.forEach(opstine, (o, i) => (
                placeholder = placeholder.concat(o.naziv, i + 1 < opstine.length ? ', ' : '')
            ));
            setOpstinePlaceholder(placeholder);

            let filteredMjesta = _.filter(allMjesta, mjesto => _.find(opstine, opstina => opstina.id === mjesto.opstina?.id));
            setMjesta(filteredMjesta);
            handleChangeSelectedMjesta([]);
        } else {
            setOpstinePlaceholder('');
            setMjesta(allMjesta);
            handleChangeSelectedMjesta([]);
        }
    }

    useEffect(() => {
        setLoading(true);
        setProgress(50);
        const entitet_ids =_.map(selectedEntiteti, e => e.id);
        const opstine_ids =_.map(selectedOpstine, o => o.id);
        const mjesta_ids = _.map(selectedMjesta, m =>  m.id);
        let codesToSubmit = _.cloneDeep(selectedNaceCodes);
        _.forEach(codesToSubmit, nace => {
            if (nace.opis) delete(nace.opis);
            if (nace.children) delete(nace.children);

        });
        const endpoint = '/search/sellers?per_page=20&page=' + currentPage + '&sort_by=' + sort + '&sort_order=' + sortOrder;

        const queryString = searchTerm === "''" ? null : searchTerm;
        setProgress(75);
        ajaxPOST({
            api: endpoint,
            auth: {
                token: Persistence.get('user_token'),
            },
            data: {
                query: queryString,
                entitet_ids: entitet_ids,
                opstina_ids: opstine_ids,
                mjesto_ids: mjesta_ids,
                nace_nivoi: codesToSubmit,
                white_label: whiteLabel === 0 ? null : whiteLabel,
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let results = response.data;
                    setSearchResults(results);
                    setPaginationInfo({
                        currentPage: response.current_page,
                        lastPage: response.last_page,
                        perPage: response.per_page,
                        from: response.from,
                        to: response.to,
                        total: response.total
                    });
                } else {
                    setSearchResults([]);
                    setPaginationInfo({currentPage: 1});
                }  
            },
            error: (status, errorMessage) => {
                if (status === 401) {
                    Actions.cleanupLogin(true);
                    window.location = '/login';
                }
            },
            finally: () => {
                setLoading(false);
                setProgress(100);
            },
            infiniteRetries: false,
        });
    }, [searchTerm, selectedEntiteti, selectedOpstine, selectedMjesta, selectedNaceCodes, whiteLabel, currentPage, sort, sortOrder])

    useEffect(() => {
        setLoading(true);
        ajaxGET({
            api: '/mjesto',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let mjesta = response.data;
                    setMjesta(mjesta);
                    setAllMjesta(mjesta);
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
        ajaxGET({
            api: '/entitet',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let entiteti = response.data;
                    setEntiteti(entiteti);
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
        ajaxGET({
            api: '/opstina',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let opstine = response.data;
                    setOpstine(opstine);
                    setAllOpstine(opstine);
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
        ajaxGET({
            api: '/nace',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let nace = response.data;
                    setNACEKlasifikacije(nace);

                    let nc = _.cloneDeep(nace);
                    const matchingL1Opis = _.filter(nc, c => (c.id == selectedNace && c.nivo == selectedNaceNivo));

                    const matchingL2Opis = _.filter(nc, c => c.children.find(c1 => (c1.id == selectedNace && c1.nivo == selectedNaceNivo)));

                    const matchingL3Opis = _.filter(nc, c => c.children.find(c1 => c1.children.find( c2 => (c2.id == selectedNace && c2.nivo == selectedNaceNivo))));

                    const matchingL4Opis = _.filter(nc, c => c.children.find(c1 => c1.children.find( c2 => c2.children.find( c3 => (c3.id == selectedNace && c3.nivo == selectedNaceNivo)))));
                    
                    let allMatching = [...matchingL1Opis]
                    
                    for (let e of matchingL2Opis) {
                        var index = allMatching.findIndex( x => x.id == e.id );
                        if (index === -1) {
                            allMatching.push(e)
                        }
                    }
                    for (let e of matchingL3Opis) {
                        var index = allMatching.findIndex( x => x.id == e.id );
                        if (index === -1) {
                            allMatching.push(e)
                        }
                    }
                    for (let e of matchingL4Opis) {
                        var index = allMatching.findIndex( x => x.id == e.id );
                        if (index === -1) {
                            allMatching.push(e)
                        }
                    }

                    setSelectedNaceCodes([...allMatching]);


                } else {
                }  
            },
            error: (status, errorMessage) => {
				handleError(status, errorMessage)
			},
            infiniteRetries: false,
        });
	}, []);


    const onSearch = (searchType, searchTerm) => {
        if (searchType == 'seller') {
            setSearchTerm(searchTerm);
            history.push(`/seller_search/${searchTerm}`);
        } else if (searchType == 'product') {
            history.push(`/product_search/${searchTerm}`);
        }
    }

    return (
        <>
            <LoadingBar
                color='#ec5020'
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <DKTopBar />
            <Header onSearch={onSearch} defaultSearchType={'seller'}/>
            <div className="product-search-container px-content-mobile md:px-content">
                <div className="mt-6 mb-2 ml-4">
                    <Breadcrumbs />
                </div>
                <div className="flex flex-col xl:flex-row">
                    <div className="my-5 flex flex-col sm:flex-row xl:flex-col w-full xl:w-1/5">
                        <div className="product-search-filters pb-5 pt-3 px-3  mx-2 xl:mx-0 w-full sm:w-1/3 xl:w-full">
                            <div className="product-search-filters-header">{selectedNace ? i18n('Trenutno odabrani NACE kod') : i18n('Izaberite NACE kod')}</div>
                            <div className="company-profile-field-input mx-2" >
                                {selectedNaceCodes && selectedNaceCodes.length > 0 ? <SelectedNace selected={selectedNaceCodes} /> : ''}
                            </div>
                            <div className={'product-search-find-nace-button mx-2 mt-4' + (!NACEKlasifikacije || NACEKlasifikacije.length === 0 ? ' disabled' : '')}
                            onClick={!NACEKlasifikacije || NACEKlasifikacije.length === 0 ? null :
                                    () => 
                                    Actions.showNACEModal(
                                        'Pronađite usluznu klasifikaciju proizvodjaca (NACE Kod)',
                                        NACEKlasifikacije,
                                        selectedNaceCodes,
                                        (nace) => setSelectedNaceCodes(nace),
                                        true
                                    )
                            } >
                                {selectedNaceCodes && selectedNaceCodes.length > 0 ? i18n('Izmjenite izabrane') : i18n('Izaberite Kod')}
                            </div>
                        </div>
                        <div className="product-search-filters pb-5 pt-3 px-3  mt-0 xl:mt-5 mx-2 xl:mx-0 w-full sm:w-1/3 xl:w-full">
                            <div className="product-search-filters-header">{i18n('Filtriranje rezultata')}</div>
                            <div className="flex flex-col mx-2">
                                <div className="vtk-seller-field-label">{i18n('Entitet:')}</div>
                                <MultipleSelect
                                    className="company-profile-field-input-dropdown"
                                    options={entiteti}
                                    optionKey="id"
                                    optionName="naziv"
                                    label={entitetiPlaceholder !== '' ? entitetiPlaceholder : null}
                                    onChange={value => handleChangeSelectedEntiteti(value)}
                                    selectedOptions={selectedEntiteti}
                                    showSelectAll={false}
                                />
                            </div>
                            <div className="flex flex-col mx-2">
                                <div className="vtk-seller-field-label">{i18n('Opština:')}</div>
                                <MultipleSelect
                                    className="company-profile-field-input-dropdown"
                                    options={opstine}
                                    optionKey="id"
                                    optionName="naziv"
                                    label={opstinePlaceholder !== '' ? opstinePlaceholder : null}
                                    onChange={value => handleChangeSelectedOpstine(value)}
                                    selectedOptions={selectedOpstine}
                                    showSelectAll={false}
                                />
                            </div>
                            <div className="flex flex-col mx-2">
                                <div className="vtk-seller-field-label">{i18n('Mjesto:')}</div>
                                <MultipleSelect
                                    className="company-profile-field-input-dropdown"
                                    options={mjesta}
                                    optionKey="postanski_broj"
                                    optionName="naziv"
                                    label={mjestaPlaceholder !== '' ? mjestaPlaceholder : null}
                                    onChange={value => handleChangeSelectedMjesta(value)}
                                    selectedOptions={selectedMjesta}
                                    showSelectAll={false}
                                />
                            </div>
                            <div className="flex flex-col mx-2">
                                <div className="vtk-seller-field-label">{i18n('White label proizvođač:')}</div>
                                <Dropdown
                                    className="company-profile-field-input-dropdown"
                                    label={i18n('Izaberite DA/NE')}
                                    onChange={e => setWhiteLabel(e)}
                                    value={whiteLabel}
                                >
                                    <Dropdown.Item key={'N/A'} value={0} className="">
                                        {i18n('Svejedno')}
                                    </Dropdown.Item>
                                    <Dropdown.Item key={'da'} value={true} className="">
                                        {i18n('Da')}
                                    </Dropdown.Item>
                                    <Dropdown.Item key={'ne'} value={false} className="">
                                        {i18n('Ne')}
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="product-search-filters pb-5 pt-3 px-3 mt-0 xl:mt-5 mx-2 xl:mx-0 w-full sm:w-1/3 xl:w-full">
                            <div className="product-search-filters-header">{i18n('Sortiranje:')}</div>
                            <div className="flex flex-col mx-2">
                                <div className="vtk-seller-field-label">{i18n('Smjer:')}</div>
                                <Dropdown
                                    className="company-profile-field-input-dropdown"
                                    label={i18n('Izaberite smjer')}
                                    onChange={e => setSortOrder(e)}
                                    value={sortOrder}
                                >
                                    <Dropdown.Item key={'asc'} value={'asc'} className="">
                                        {i18n('Rastuće')}
                                    </Dropdown.Item>
                                    <Dropdown.Item key={'desc'} value={'desc'} className="">
                                        {i18n('Opadajuće')}
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                            <div className="flex flex-col mx-2">
                                <div className="vtk-seller-field-label">{i18n('Polje:')}</div>
                                <Dropdown
                                    className="company-profile-field-input-dropdown"
                                    label={i18n('Izaberite polje')}
                                    onChange={e => setSort(e)}
                                    value={sort}
                                >
                                    <Dropdown.Item key={'naziv'} value={'naziv'} className="">
                                        {i18n('Naziv')}
                                    </Dropdown.Item>
                                    <Dropdown.Item key={'opis'} value={'opis'} className="">
                                        {i18n('Opis')}
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    <div className="product-results-list w-full xl:w-4/5 mx-1 pb-4">
                    {loading ? 
                        <Loading /> 
                            :
                        <>
                            {searchResults?.length > 0 ? <CompanyList companies={searchResults} /> : <div className="no-results-placeholder">{i18n('Nema rezultata pretrage')}</div>}
                        </>
                    }
                    <ReactPaginate
                        previousLabel={i18n('Prethodna')}
                        nextLabel={i18n('Sledeća')}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={paginationInfo.lastPage ? paginationInfo.lastPage : 1}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={(data) => handlePageClick(data)}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                    />
                    </div>
                </div>
            </div>
        </>
    )
}

export default connect(state => ({
	i18n: state.i18n,
}))(CompanySearch);
