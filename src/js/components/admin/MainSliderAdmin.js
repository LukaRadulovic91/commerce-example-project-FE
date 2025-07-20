import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import { connect } from 'react-redux';
import { CarouselProvider, Slide, Slider, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import AdminHomeSlide from '../ui/AdminHomeMainCarouselSlide';
import Icon from '@ui/Icon';

const MainSliderAdmin = () => {
	const i18n = Hooks.useI18n();
    const [unsaved, setUnsaved] = useState(false);
    const [slides, setSlides] = useState([]);

    const updateSlides = (slides) => {
        setSlides(slides);
        setUnsaved(true);
    }

    const submitSlider = () => {
        let slidesToSubmit = [...slides];
        slidesToSubmit.forEach((slide, index) => {
           slide.position = index;
        });

        ajaxPOST({
            api: '/admin/sliders/photos/main',
            data: {
                content: slidesToSubmit,
            },
            auth: {
                token: Persistence.get('user_token'),
            },
            infiniteRetries: false,
            success: response => {
                if (response.success && response.message == "OK") {
                    setSlides(response.data?.content ? response.data.content : []);
                    setUnsaved(false);
                    Actions.addModal('Ažuriranje uspješno!', '');
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
            },
        });
    }

    useEffect(() => {
        ajaxGET({
            api: '/content/sliders/photos/main',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let slides = response.data?.content ? response.data.content : [];
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

    return (
        <div className="mb-20">
            <div className="mb-10">{i18n('Pregled glavnog slidera.')}</div>
            <div
                className={'admin-home-main-carousel-content'}
            >
                <CarouselProvider
                    naturalSlideWidth={842}
                    naturalSlideHeight={542}
                    visibleSlides={2}
                    orientation="horizontal"
                    totalSlides={slides?.length + 1}
                >
                    <div className="admin-carousel-frame">
                        <ButtonBack
                            className={
                                'admin-home-carousel-button'
                            }
                        >
							<i className="fas fa-angle-left" />
						</ButtonBack>
                        <Slider className="admin-home-carousel">
                            {_.map(slides, (slide, index) => (
                                <Slide key={slide.id} index={index}>
                                    <div className={'hover-button-overlay'}>
                                        <AdminHomeSlide slide={slide} />
                                        <div className={'hover-button w-full h-full'}>
                                            <div 
                                                className="w-1/4 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                                onClick={() => {
                                                    let modifiedSlides = [...slides];
                                                    modifiedSlides.push(modifiedSlides.shift());
                                                    updateSlides(modifiedSlides);
                                                }}>
                                                <Icon icon="angle-left" />
                                            </div>
                                            <div 
                                                className="w-1/4 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                                onClick={() => 
                                                    Actions.showAddSlideModal(
                                                        'Dodajte novi slide za glavni slider na glavnoj stranici',
                                                        slide,
                                                        (slide) => {
                                                            let modifiedSlides = [...slides];
                                                            modifiedSlides[index] = slide;
                                                            updateSlides(modifiedSlides)
                                                        },
                                                    )}
                                                >
                                                <Icon icon="edit" />
                                            </div>
                                            <div 
                                                className="w-1/4 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
                                                onClick={() => {
                                                    let modifiedSlides = [...slides];
                                                    modifiedSlides.splice(index, 1);
                                                    updateSlides(modifiedSlides)
                                                }}
                                                >
                                                <Icon icon="trash" />
                                            </div>
                                            <div 
                                                className="w-1/4 h-full cursor-pointer text-3xl text-center text-white bg-black-smoke hover-highlight"
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
                            <Slide key={'add_new_slide'} index={slides?.length}>
                                <div 
                                    className="add-slide cursor-pointer"
                                    onClick={() => 
                                        Actions.showAddSlideModal(
                                            'Dodajte novi slide za glavni slider na glavnoj stranici',
                                            null,
                                            (slide) => updateSlides([...slides, slide])
                                        )
                                }>
                                    <div className="add-slide-icon cursor-pointer text-center">
                                        <Icon icon="plus" />
                                    </div>
                                </div>
                            </Slide>
                        </Slider>
                        <ButtonNext
							className={
								'admin-home-carousel-button'
							}
						>
							<i className="fas fa-angle-right" />
						</ButtonNext>
                    </div>
                </CarouselProvider>
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
}))(MainSliderAdmin);
