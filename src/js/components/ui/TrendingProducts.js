import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useState, useEffect } from 'react';
import { ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import { connect } from 'react-redux';
import ProductCarousel from './ProductCarousel';

const TrendingProducts = (props) => {
	const i18n = Hooks.useI18n();
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        props.onStartedLoad && props.onStartedLoad();
        ajaxGET({
            api: '/content/sliders/proizvodi/slajder_proizvoda',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
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
            finally: () => {
                props.onFinishedLoad && props.onFinishedLoad();
            },
            infiniteRetries: false,
        });
	}, []);


    return (
        <div className={'home-trending-carousel-wrapper' + ' ' + props.className}>
            <ProductCarousel slides={slides} productMode={false} trending={true}  />
        </div>
    )
}

export default connect(state => ({
	i18n: state.i18n,
}))(TrendingProducts);
