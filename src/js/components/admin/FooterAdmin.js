import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { ajaxPOST, ajaxGET, handleError } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import { connect } from 'react-redux';
import { CarouselProvider, Slide, Slider, ButtonBack, ButtonNext } from 'pure-react-carousel';
import Icon from '@ui/Icon';
import PartnerLogoSlide from '@ui/PartnerLogoSlide';
import TextField from '@ui/TextField';
import MultipleSelect from '@ui/MultipleSelect';

const FooterAdmin = () => {
	const i18n = Hooks.useI18n();

    const PartnersLogoSliderAdmin = (props) => {
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
               if (slide.seller?.photo_logo) delete(slide.seller?.photo_logo);
            });
            
            ajaxPOST({
                api: '/admin/sliders/sellers/slajder_footer',
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
            const entitet_ids =_.map(selectedEntiteti, e => e.id);
            const opstine_ids =_.map(selectedOpstine, o => o.id);
            const mjesta_ids = _.map(selectedMjesta, m =>  m.id);

            ajaxPOST({
                api: '/search/sellers?per_page=20&page=1',
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
                api: '/content/sliders/sellers/slajder_footer',
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
    
        const addSellerToSlider = (seller) => {
            if (_.find(slides, s => s.seller.id === seller.id)) {
                return;
            }
            let slide = {
                seller: {
                    id: seller.id,
                    photo_logo: {...seller.photo_logo}
                },
                position: slides.length
            };
            setSlides([...slides, slide]);
        }

        return (
            <div>
                <div
                    className={'admin-partner-logo-carousel-content'}
                >
                    <CarouselProvider
                        naturalSlideWidth={140}
                        naturalSlideHeight={140}
                        visibleSlides={1}
                        orientation="horizontal"
                        totalSlides={slides.length}
                    >
                        <div className="partner-logo-carousel-frame">
                            <ButtonBack
                                className={
                                    'partner-logo-carousel-button'
                                }
                            >
                                <i className="fas fa-angle-left" />
                            </ButtonBack>
                            <Slider className="partner-logo-carousel">
                                {_.map(slides, (slide, index) => (
                                    <Slide key={slide.seller.id} index={index}>
                                        <div className={'hover-button-overlay'}>
                                            <PartnerLogoSlide slide={slide} />
                                            <div className={'hover-button partner-logo w-full h-full'}>
                                                <div 
                                                    className="w-1/3 h-full cursor-pointer text-xl text-center text-white bg-black-smoke hover-highlight"
                                                    onClick={() => {
                                                        let modifiedSlides = [...slides];
                                                        modifiedSlides.push(modifiedSlides.shift());
                                                        updateSlides(modifiedSlides);
                                                    }}>
                                                    <Icon icon="angle-left" />
                                                </div>
                                                <div 
                                                    className="w-1/3 h-full cursor-pointer text-xl text-center text-white bg-black-smoke hover-highlight"
                                                    onClick={() => {
                                                        let modifiedSlides = [...slides];
                                                        modifiedSlides.splice(index, 1);
                                                        updateSlides(modifiedSlides)
                                                    }}
                                                    >
                                                    <Icon icon="trash" />
                                                </div>
                                                <div 
                                                    className="w-1/3 h-full cursor-pointer text-xl text-center text-white bg-black-smoke hover-highlight"
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
                                    'partner-logo-carousel-button'
                                }
                            >
                                <i className="fas fa-angle-right" />
                            </ButtonNext>
                        </div>
                    </CarouselProvider>
                </div>
                <div className="mt-20">{i18n('Pretraga partnera:')}</div>
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
                    {_.map(searchResults, (seller, index) => (
                        <div className={'flex flex-row'} key={seller.id} index={index}>
                            <img className="product-results-list-image" src={seller.photo_logo?.url}/>
                            <div className="ml-4 mt-auto mb-auto h-full flex flex-col text-lg">
                                <div className={'font-bold'}>
                                    {i18n('Naziv:')}{' '}{seller.naziv}
                                </div>
                                <div className={''}>
                                    {i18n('JIB proizvođača:')}{' '}{seller.jib}
                                </div>
                                <div className={''}>
                                    {i18n('Lokacija proizvođača:')}{' '}{seller.mjesto?.naziv}{' Opština:'}{seller.mjesto?.opstina?.naziv}
                                </div>
                            </div>
                            <div 
                                className="button px-4 ml-auto mt-auto mb-auto cursor-pointer text-center"
                                onClick={() => addSellerToSlider(seller)}
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

    const FooterLinksAdmin = () => {
        const [unsaved, setUnsaved] = useState(false);
        const [links, setLinks] = useState([]);
        const [label, setLabel] = useState('');
        const [link, setLink] = useState('');

        const addLink = () => {
            let linkToAdd = {
                label: label,
                url: link,
                position: links.length,
            };
            setLinks([...links, linkToAdd]);
            setUnsaved(true);
            setLink('');
            setLabel('');
        }
    
        const submitFooterLinks = () => {
            let linksToSubmit = _.cloneDeep(links);
            linksToSubmit.forEach((link, index) => {
               link.position = index;
            //    delete(slide.proizvod.photo_1);
            });
            
            ajaxPOST({
                api: '/admin/links/footer',
                data: {
                    links: links,
                },
                auth: {
                    token: Persistence.get('user_token'),
                },
                infiniteRetries: false,
                success: response => {
                    if (response.success && response.message === "OK") {
                        setLinks(response.data.content);
                        setUnsaved(false);
                        Actions.addModal('Ažuriranje uspješno!', '');
                    } else {
                        Actions.addModal('Greška', i18n(response.message));
                    }
                },
                error: (status, errorMessage) => {
                    handleError(status, errorMessage)
                },
            });
        }
    
        useEffect(() => {
            ajaxGET({
                api: '/content/links/footer',
                success: response => {
                    if (response.success && response.message === "OK") {
                        let links = response.data;
                        setLinks(links);
                    } else {
                    }  
                },
                error: (status, errorMessage) => {
                    handleError(status, errorMessage)
                },
                infiniteRetries: false,
            });
        }, []);

        return (
            <div className="flex flex-col">
                <div className="flex flex-col footer-links ml-10">
                    <div className="footer-links-header">{i18n('Eksterni linkovi')}</div>
                    {_.map(links, link => (
                        <a className="footer-link" href={link.url}>
                            {link.label}
                        </a>
                    ))}
                </div>
                <div className="flex flex-row ml-10">
                    <div className="vtk-seller-field-label mr-4">{i18n('Labela')}</div>
                    <TextField
                        className={'vtk-seller-field-input mr-6'}
                        maxLength="254"
                        value={label}
                        onChange={e => setLabel(e.target.value)}
                    />
                    <div className="vtk-seller-field-label mr-4">{i18n('URL Link')}</div>
                    <TextField
                        className={'vtk-seller-field-input mr-6'}
                        maxLength="254"
                        type="url"
                        value={link}
                        onChange={e => setLink(e.target.value)}
                    />
                    <div 
                        className="button px-4 ml-6 mt-auto mb-auto cursor-pointer text-center"
                        onClick={() => addLink()}
                    >
                        <Icon icon="plus" />
                    </div>
                </div>
                <div className="flex flex-row flex-end mt-10">
                    <div onClick={() => { setLinks([]); setUnsaved(true); }} className="button signup-button mr-auto">
                        {i18n('Reset linkova')}
                    </div>
                    <div 
                        className={'button login-button ml-auto' + (unsaved ? '' : ' disabled')}
                        onClick={() => submitFooterLinks()}
                    >
                        {i18n('Sačuvajte linkove')}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-10">{i18n('Pregled footer linkova')}</div>
            <div
                className={'admin-footer-content w-full h-full mb-20'}
            >
                <FooterLinksAdmin />
            </div>
            <div className="mb-10">{i18n('Pregled footer slajdera')}</div>
            <div
                className={'admin-footer-content w-full h-full mt-10 mb-10'}
            >
                <PartnersLogoSliderAdmin />
            </div>
            
        </div>
    )
}

export default connect(state => ({
	i18n: state.i18n,
}))(FooterAdmin);
