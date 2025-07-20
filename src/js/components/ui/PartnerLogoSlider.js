import _ from 'lodash';

import Hooks from '@/hooks';
import Loading from '@ui/Loading';
import { CarouselProvider, Slide, Slider, ButtonBack, ButtonNext } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import PartnerLogoSlide from '@ui/PartnerLogoSlide';

const PartnerLogoSlider = ({
	slides, className
}) => {
	const i18n = Hooks.useI18n();
	if (slides === false) {
		return <Loading />;
	}

	return (
        <div className={'admin-partner-logo-carousel-content ' + className} >
            <div className="footer-links-header pt-1">{i18n('Partneri')}</div>
            <CarouselProvider
                naturalSlideWidth={140}
                naturalSlideHeight={140}
                visibleSlides={1}
                orientation="horizontal"
                totalSlides={slides?.length}
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
	);
};

export default PartnerLogoSlider;
