import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import { connect } from 'react-redux';
import { CarouselProvider, Slide, Slider, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import Icon from '@ui/Icon';
import TextField from '@ui/TextField';
import MultipleSelect from '@ui/MultipleSelect';
import ProductSlide from '@ui/HomeProductSlide';

const TrendingSliderAdmin = () => {
	const i18n = Hooks.useI18n();
    const [unsaved, setUnsaved] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
    const [slides, setSlides] = useState([]);

    const updateSlides = (slides) => {
        setSlides(slides);
        setUnsaved(true);
    }

    const handleChangeSelectedMjesta = (mjesta) => {
        setSelectedMjesta(mjesta);
        let placeholder = '';
        _.forEach(mjesta, (o, i) => (
            placeholder = placeholder.concat(o.naziv, i + 1 < mjesta.length ? ', ' : '')
        ));
        setMjestaPlaceholder(placeholder);
    }

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

    const submitSlider = () => {
        let slidesToSubmit = _.cloneDeep(slides);
        slidesToSubmit.forEach((slide, index) => {
           slide.position = index;
           if (slide.proizvod.photo_1) delete(slide.proizvod.photo_1);
           if (slide.proizvod.photo_2) delete(slide.proizvod.photo_2);
           if (slide.proizvod.photo_3) delete(slide.proizvod.photo_3);
           if (slide.proizvod.photo_4) delete(slide.proizvod.photo_4);
           if (slide.proizvod.hs) delete(slide.proizvod.hs);
        });
        
        ajaxPOST({
            api: '/admin/sliders/proizvodi/slajder_proizvoda',
            data: {
                content: slidesToSubmit,
            },
            auth: {
                token: Persistence.get('user_token'),
            },
            infiniteRetries: false,
            success: response => {
                if (response.success && response.message == "OK") {
                    setSlides(response.data.content);
                    setUnsaved(false);
                    Actions.addModal('Ažuriranje uspješno!', '');
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
            },
        });
    }

    useEffect(() => {
        if (searchTerm === '') {
            setSearchResults([]);
            return
        } else {
            if (searchTerm.length > 3) {
                const entitet_ids =_.map(selectedEntiteti, e => e.id);
                const opstine_ids =_.map(selectedOpstine, o => o.id);
                const mjesta_ids = _.map(selectedMjesta, m =>  m.id);

                ajaxPOST({
                    api: '/search/proizvodi?per_page=20&page=1',
                    auth: {
                        token: Persistence.get('user_token'),
                    },
                    data: {
                        query: searchTerm,
                        entitet_ids: entitet_ids,
                        opstina_ids: opstine_ids,
                        mjesto_ids: mjesta_ids,
                    },
                    success: response => {
                        if (response.success && response.message == "OK") {
                            let results = response.data;
                            setSearchResults(results);
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
            }
        }
    }, [searchTerm, selectedEntiteti, selectedOpstine, selectedMjesta])

    useEffect(() => {
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
            api: '/content/sliders/proizvodi/slajder_proizvoda',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let slides = response.data.content;
                    setSlides(slides);
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

    const addProductToSlider = (product) => {
        if (_.find(slides, s => s.proizvod.id === product.id)) {
            return;
        }
        let slide = {
            proizvod: {
                id: product.id,
                photo_1: {...product.photo_1}
            },
            position: slides.length
        };
        setSlides([...slides, slide]);
    }

    return (
        <div className="mb-20">
            <div className="mb-10">{i18n('Pregled slidera proizvoda u trendu:')}</div>
            <div
                className={'home-trending-carousel-content'}
            >
                <CarouselProvider
                    naturalSlideWidth={280}
                    naturalSlideHeight={280}
                    visibleSlides={5}
                    orientation="horizontal"
                    totalSlides={slides.length + 1}
                >
                    <div className="product-carousel-frame">
                        <ButtonBack
                            className={
                                'home-product-carousel-button'
                            }
                        >
							<i className="fas fa-angle-left" />
						</ButtonBack>
                        <Slider className="home-product-carousel">
                            {_.map(slides, (slide, index) => (
                                <Slide key={slide.id} index={index}>
                                    <div className={'hover-button-overlay'}>
                                        <ProductSlide slide={slide} />
                                        <div className={'hover-button product w-full h-full'}>
                                            <div 
                                                className="w-1/3 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                                onClick={() => {
                                                    let modifiedSlides = [...slides];
                                                    modifiedSlides.push(modifiedSlides.shift());
                                                    updateSlides(modifiedSlides);
                                                }}>
                                                <Icon icon="angle-left" />
                                            </div>
                                            <div 
                                                className="w-1/3 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                                onClick={() => {
                                                    let modifiedSlides = [...slides];
                                                    modifiedSlides.splice(index, 1);
                                                    updateSlides(modifiedSlides)
                                                }}
                                                >
                                                <Icon icon="trash" />
                                            </div>
                                            <div 
                                                className="w-1/3 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                                onClick={() => {
                                                    let modifiedSlides = [...slides];
                                                    modifiedSlides.unshift(modifiedSlides.pop());
                                                    updateSlides(modifiedSlides);
                                                }}>
                                                <Icon icon="angle-right" />
                                            </div>
                                        </div>
                                    </div>
                                </Slide>
                            ))}
                        </Slider>
                        <ButtonNext
							className={
								'home-product-carousel-button'
							}
						>
							<i className="fas fa-angle-right" />
						</ButtonNext>
                    </div>
                </CarouselProvider>
            </div>
            <div className="mt-20">{i18n('Pretraga proizvoda:')}</div>
            <div className="flex flex-row w-full mt-8">
                <div className="w-2/5 flex flex-col">
                    <div className="vtk-seller-field-label">{i18n('Naziv:')}</div>
                    <TextField
                        className={'nace-search-field vtk-seller-field-input w-full'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-1/5 flex flex-col mx-2">
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
                <div className="w-1/5 flex flex-col mx-2">
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
                <div className="w-1/5 flex flex-col mx-2">
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
            </div>
            <div className="product-results-list-admin">
                {_.map(searchResults, (product, index) => (
                    <div className={'flex flex-row'} key={product.id} index={index}>
                        <img className="product-results-list-image" src={product.photo_1?.url}/>
                        <div className="ml-4 mt-auto mb-auto h-full flex flex-col text-lg">
                            <div className={'font-bold'}>
                                {i18n('Naziv:')}{' '}{product.naziv}
                            </div>
                            <div className={''}>
                                {i18n('Naziv proizvođača:')}{' '}{product.seller?.naziv}
                            </div>
                            <div className={''}>
                                {i18n('Carinska tarifa:')}{' '}{product.carinska_tarifa?.hs?.id}{' Opis: '}{product.carinska_tarifa?.hs?.opis}
                            </div>
                            <div className={''}>
                                {i18n('Godišnja količina:')}{' '}{product.carinska_tarifa?.hs?.godisnja_kolicina}
                            </div>
                            <div className={''}>
                                {i18n('JIB proizvođača:')}{' '}{product.seller?.jib}
                            </div>
                            <div className={''}>
                                {i18n('Lokacija proizvođača:')}{' '}{product.seller?.mjesto?.naziv}{' Opština:'}{product.seller?.mjesto?.opstina?.naziv}
                            </div>
                        </div>
                        <div 
                            className="button px-4 ml-auto mt-auto mb-auto cursor-pointer text-center"
                            onClick={() => addProductToSlider(product)}
                        >
                            <Icon icon="plus" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-row flex-end mt-10">
                <div onClick={() => { setSlides([]); setUnsaved(true); }} className="button signup-button mr-auto">
                    {i18n('Reset slajdera')}
                </div>
                <div 
                    className={'button login-button ml-auto' + (unsaved ? '' : ' disabled')}
                    onClick={() => submitSlider()}
                >
                    {i18n('Sačuvajte slajder')}
                </div>
            </div>
        </div>
    )
}

export default connect(state => ({
	i18n: state.i18n,
}))(TrendingSliderAdmin);
