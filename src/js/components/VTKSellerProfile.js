import { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Redirect, Route, Switch, withRouter } from 'react-router-dom';

import Content from '@/components/ui/Content';
import Persistence from '@/modules/Persistence';

import SellerBasicInfoForm from './forms/SellerBasicInfoForm';
import SellerActivitiesForm from './forms/SellerActivitiesForm';
import SellerNACEClassificationForm from './forms/SellerNACEClassificationForm';
import SellerHSClassificationForm from './forms/SellerHSClassificationForm';
import SellerMarketOrientationForm from './forms/SellerMarketOrientationForm';
import TopBar from './ui/TopBar';

import 'css/pages/vtk_seller.css';

class VTKSellerProfile extends Component {
	componentDidMount() {
	}
	componentDidUpdate() {
	}

	render() {
        const { i18n } = this.props;
		const stepFilled = Persistence.get('vtk_form_step_filled');
        
		return (
			<Content className="vtk-seller-content">
                <TopBar />
				<div className="tabs text-3xs md:text-sm uppercase">
                    <NavLink className="tab px-0 lg:px-8 w-1/5 first" to="/vtk_form/basic_info">
                        {i18n('Osnovni podaci')}
						<div className="footnote hidden lg:flex  ml-0 lg:ml-14">{i18n('Uredite podatke')}</div>
                    </NavLink>

                    {stepFilled !== null && stepFilled >= 1 ? 
						(
							<NavLink className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first" to="/vtk_form/activity">
								{i18n('Djelatnost Kompanije')}
								<div className="footnote hidden lg:flex  ml-0 lg:ml-14">{i18n('Uredite podatke')}</div>
							</NavLink>
						) : (
							<div className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first disabled">
								{i18n('Djelatnost Kompanije')}
							</div>
						)}

					{stepFilled !== null && stepFilled >= 2 ? 
						(
							<NavLink className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first" to="/vtk_form/nace">
								{i18n('Klasifikacija (NACE)')}
								<div className="footnote hidden lg:flex  ml-0 lg:ml-14">{i18n('Uredite podatke')}</div>
							</NavLink>
						) : (
							<div className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first disabled">
								{i18n('Klasifikacija (NACE)')}
							</div>
						)}

					{stepFilled !== null && stepFilled >= 3 ? 
						(
							<NavLink className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first" to="/vtk_form/hs">
								{i18n('Carinske tarife (HS)')}
								<div className="footnote hidden lg:flex  ml-0 lg:ml-14">{i18n('Uredite podatke')}</div>
							</NavLink>
						) : (
							<div className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first disabled">
								{i18n('Carinske tarife (HS)')}
							</div>
						)}

					{stepFilled !== null && stepFilled >= 4 ? 
						(
							<NavLink className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first" to="/vtk_form/market">
								{i18n('Tržišna orjentacija')}
								<div className="footnote hidden lg:flex  ml-0 lg:ml-14">{i18n('Uredite podatke')}</div>
							</NavLink>
						) : (
							<div className="tab px-0 lg:px-8 w-1/5 px-0 md:px-5 not-first disabled">
								{i18n('Tržišna orjentacija')}
							</div>
						)}
				</div>

				<Switch location={location}>
					<Route path="/vtk_form" exact>
						<Redirect to="/vtk_form/basic_info" />
					</Route>
					<Route path="/vtk_form/basic_info" component={SellerBasicInfoForm} />
					<Route path="/vtk_form/activity" component={SellerActivitiesForm} />
					<Route path="/vtk_form/nace" exact component={SellerNACEClassificationForm} />
					<Route path="/vtk_form/hs" component={SellerHSClassificationForm} />
					<Route path="/vtk_form/market" component={SellerMarketOrientationForm} />
				</Switch>
			</Content>
		);
	}
}

export default withRouter(
	connect(state => ({
		i18n: state.i18n,
	}))(VTKSellerProfile)
);
