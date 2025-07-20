import _ from 'lodash';
import { useRef, useState, useEffect } from 'react';

import Actions from '@/actions';
import Hooks from '@/hooks';
import { ajaxGET } from '@/modules/ajax';
import minidash from '@/modules/minidash';
import Persistence from '@/modules/Persistence';

import Icon from '@ui/Icon';
import Loading from '@ui/Loading';
import ProductSlide from './HomeProductSlide';

const HighlightedProducts = ({
	scrollDisabled = false,
	className,
}) => {
	const i18n = Hooks.useI18n();
	const scrollRef = useRef();
	const [windowSize, setWindowSize] = useState(window.innerWidth);
    const [slides, setSlides] = useState([]);

	window.addEventListener(
		'resize',
		() => {
			setWindowSize(window.innerWidth);
		},
		false
	);

    useEffect(() => {
        ajaxGET({
            api: '/content/sliders/proizvodi/recent',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message === "OK") {
                    let slides = response.data?.content;
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

	if (slides === false) {
		return <Loading />;
	}

	let featuredProduct = slides?.[0];

	if (slides.length < 5) {
		scrollDisabled = true;
	}

	const FeaturedProduct = ({ style, entry }) => {

		return (
			<div
				key={entry.id}
				className="relative product-slide overflow-hidden"
				style={{
					...style,
					width: '48.92%',
				}}
			>
                <ProductSlide slide={entry} featured />
			</div>
		);
	};

	const Article = ({ className, style, entry }) => {

		return (
			<div
				key={entry.id}
				className={minidash.cs(
					'rounded-default',
					className
				)}
				style={{
					...style,
				}}
			>
				<ProductSlide slide={entry} />
			</div>
		);
	};

	const handleScroll = direction => {
		scrollRef?.current.scrollBy({
			left: direction * scrollRef.current.clientWidth,
			behavior: 'smooth',
		});
	};

	const mobile = windowSize < 600;
	if (mobile) {
		scrollDisabled = true
	}

    const articlesPerPage = windowSize > 1360 ? 6 : (windowSize > 1150 ? 5 : (windowSize > 950 ? 4 : (windowSize > 760 ? 2 : 0)));
    const featuredArticlePercentage = windowSize > 1360 ? 34 : (windowSize > 1150 ? 41 : (windowSize > 950 ? 51 : (windowSize > 760 ? 66 : 100)));
	const scrollWidth = Math.ceil((slides.length - 4) / 8) * 100 + 100;
	const featuredCardWidth = mobile ? 35 : (1 / Math.floor(scrollWidth / 100)) * featuredArticlePercentage;

    let slidesExcludingFeatured = _.slice(slides, 1);

	return (
        <div className="highlighted-products-carousel-wrapper">
            <div className={minidash.cs(
                'highlighted-products-carousel',
                className
            )}>
                <div
                    className={minidash.cs(
                        'w-full',
                        scrollDisabled ? 'overflow-scroll px-6 ' : 'flex flex-row justify-start items-center'
                    )}
                >
                    {!scrollDisabled && (
                        <div
                            onClick={() => handleScroll(-1)}
                            className={
                                'angle left h-full w-20 flex items-center justify-center mt-auto mb-auto cursor-pointer carousel-button'
                            }
                        >
                            <div className="">
                                <Icon icon={'angle-left'} size="3x" className="" />
                            </div>
                        </div>
                    )}
                    <div
                        className={minidash.cs(
                            'justify-start',
                            !scrollDisabled ? 'w-full overflow-x-hidden overflow-y-hidden' : ''
                        )}
                        style={{
                            minWidth: !scrollDisabled ? '0' : '1200px',
                            ...(!scrollDisabled ? { maxWidth: '1439px' } : {}),
                        }}
                        ref={scrollRef}
                    >
                        <div
                            className={minidash.cs('flex flex-row', scrollDisabled ? 'w-full' : '')}
                            style={scrollDisabled ? { height: '390px', paddingTop: '4px' } : { minWidth: `${scrollWidth}%`, height: '390px', paddingTop: '4px' }}
                        >
                            {featuredProduct && (
                                <FeaturedProduct
                                    key={featuredProduct?.proizvod.id}
                                    style={{
                                        maxWidth: `calc(${featuredCardWidth}% - 31px)`,
                                        marginRight: '31px',
                                    }}
                                    entry={featuredProduct}
                                />
                            )}
                            <div
                                className={minidash.cs('flex flex-col flex-wrap justify-start content-start')}
                                style={{
                                    width: `${100 - featuredCardWidth}%`,
                                }}
                            >
                                {slidesExcludingFeatured.map(e => (
                                    <Article
                                        key={e.proizvod?.id}
                                        className="odd:mb-2"
                                        style={{
                                            width: `calc(${
                                                100 / (Math.ceil(scrollWidth / 100) * articlesPerPage) / ((100 - featuredCardWidth) / 100)
                                            }% - 31px`,
                                            height: 'calc(50% - 8px)',
                                            marginRight: '31px',
                                        }}
                                        entry={e}
                                        grid
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {!scrollDisabled && (
                        <div
                            onClick={() => handleScroll(1)}
                            className={
                                'angle right h-full w-20 flex items-center justify-center mt-auto mb-auto cursor-pointer carousel-button'
                            }
                        >
                            <div className="">
                                <Icon icon={'angle-right'} size="3x" className="" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
	);
};

export default HighlightedProducts;
