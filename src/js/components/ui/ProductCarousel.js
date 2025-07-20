import _ from 'lodash';

import { useState } from 'react';
import Hooks from '@/hooks';
import Loading from '@ui/Loading';
import { CarouselProvider, Slide, Slider, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import ProductSlide from '@ui/HomeProductSlide';
import Icon from '@ui/Icon';

const ProductCarousel = ({
	slides,
    sellerId,
    productMode,
    trending
}) => {
	const i18n = Hooks.useI18n();
    const [windowSize, setWindowSize] = useState(window.innerWidth);

	window.addEventListener(
		'resize',
		() => {
			setWindowSize(window.innerWidth);
		},
		false
	);
	if (slides === false || slides === null) {
		return <Loading />;
	}
    
    const visibleSlides = windowSize > 1360 ? 5 : (windowSize > 1150 ? 4 : (windowSize > 950 ? 3 : (windowSize > 760 ? 2 : 1)));

	return (
        <div className={'home-trending-carousel-content'} >
            <CarouselProvider
                naturalSlideWidth={280}
                naturalSlideHeight={280}
                visibleSlides={visibleSlides}
                orientation="horizontal"
                totalSlides={slides?.length + 1}
            >
                <div className="product-carousel-frame">
                    <ButtonBack
                        className={
                            'select-none home-product-carousel-button ml-2'
                        }
                    >
                        <Icon icon={'angle-left'} size="3x" className="" />
                    </ButtonBack>
                    <Slider className="home-product-carousel">
                        {_.map(slides, (slide, index) => (
                            <Slide key={slide.proizvod?.id} index={index}>
                                <ProductSlide productMode={productMode} slide={slide} sellerId={sellerId} trending={trending} />
                            </Slide>
                        ))}
                    </Slider>
                    <ButtonNext
                        className={
                            'select-none home-product-carousel-button mr-2'
                        }
                    >
                        <Icon icon={'angle-right'} size="3x" className="" />
                    </ButtonNext>
                </div>
            </CarouselProvider>
        </div>
	);
};

export default ProductCarousel;
