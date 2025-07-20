import _ from 'lodash';
import { useEffect, useState } from 'react';
import { ajaxGET } from '@/modules/ajax';
import { connect } from 'react-redux';
import { CarouselProvider, Slide, Slider, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

import Icon from '@ui/Icon';
import Hooks from '@/hooks';
import HomeSlide from './HomeMainCarouselSlide';

const HomeMainCarousel = ({
	visibleSlides,
}) => {
	const i18n = Hooks.useI18n();
    const [slides, setSlides] = useState([]);
	
    useEffect(() => {
        ajaxGET({
            api: '/content/sliders/photos/main',
            success: response => {
                if (response.success && response.message == "OK") {
                    let slides = response.data?.content;
                    setSlides(slides);
                } else {
                }  
            },
            error: (status, errorMessage) => {
            },
            infiniteRetries: false,
        });
	}, []);

	if (!slides) {
		<div
            className={'home-main-carousel-content'}
        />
	}

	return (
        <div
            className={'home-main-carousel-content mt-6 lg:mt-0'}
        >
            <CarouselProvider
                naturalSlideWidth={842}
                naturalSlideHeight={542}
                visibleSlides={1}
                orientation="horizontal"
                totalSlides={slides?.length}
                isPlaying={true}
            >
                <div className="carousel-frame">
                    <ButtonBack className="carousel-button-back"><Icon icon="angle-left" size="2x" /></ButtonBack>
                    <Slider className="home-carousel">
                        {_.map(slides, (slide, index) => (
                            <Slide tag="a" key={slide.action_url + slide.photo?.id} index={index}>
                                <HomeSlide slide={slide} />
                            </Slide>
                        ))}
                    </Slider>
                    <ButtonNext className="carousel-button-next"><Icon icon="angle-right" size="2x" /></ButtonNext>
                </div>
            </CarouselProvider>
        </div>
	);
};

export default connect(state => ({
	i18n: state.i18n,
}))(HomeMainCarousel);
