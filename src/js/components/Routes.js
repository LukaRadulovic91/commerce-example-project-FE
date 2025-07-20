import { Route, Switch, Redirect } from 'react-router-dom';

import Hooks from '@/hooks';
import Persistence from '@/modules/Persistence';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import VTKSellerProfile from './VTKSellerProfile';
import DKHome from './DKHome';
import DKAdmin from './Admin';
import ProductSearch from './ProductSearch';
import Product from './Product';
import CompanySearch from './CompanySearch';
import Company from './Company';
import VerifyEmail from './VerifyEmail';
import ContactUs from './ContactUs';
import BuyerProfile from './BuyerProfile';
import VTKAdmin from './admin/VTKAdmin';

const Routes = props => {
	const token = Persistence.get('user_token');
    const userRole = Hooks.useUserRole();
    const isAdmin = userRole && userRole?.name === 'VTK Admin' || userRole?.name === 'Admin' || userRole?.name === 'Editor' || userRole?.name === 'Super Admin';
	const isVTKAdmin = userRole && userRole?.name === 'VTK Admin';

	return (
		<Switch location={props.location}>
			<Route path="/vtk_form" component={VTKSellerProfile} >
				{!token && <Redirect to="/" />}
			</Route>

			<Route path="/" exact component={DKHome} />

			<Route path="/welcome" exact component={DKHome}>
				{token && <Redirect to="/" />}
			</Route>

			<Route path="/login" component={Login} >
				{token && <Redirect to="/" />}
			</Route>

			<Route path="/admin" component={DKAdmin} >
				{(!token || !isAdmin) && <Redirect to="/" /> }
			</Route>

			<Route path="/vtk_admin" component={VTKAdmin} >
				{(!token || !isVTKAdmin) && <Redirect to="/" /> }
			</Route>

			<Route path="/signup/:token" component={SignUp} />
			<Route path="/signup" component={SignUp} />

			<Route path="/email-verify/" component={VerifyEmail} />
			<Route path="/forgot_password/" component={ForgotPassword} />
			<Route path="/password-reset/:token" component={ForgotPassword} />

			<Route path="/product_search/:searchString?/:selectedHs?/:selectedHsNivo?" component={ProductSearch} />
			<Route path="/product/:id" component={Product} />

			<Route path="/seller_search/:searchString?/:selectedNace?/:selectedNaceNivo?" component={CompanySearch} />
			<Route path="/company/:id" component={Company} />

			<Route path="/buyer_profile/" component={BuyerProfile} />

			<Route path="/contact-us" component={ContactUs} />

			<Route path="*" component={DKHome} >
			{
				isAdmin ? <Redirect to="/admin" /> : 
				<Redirect to="/" />
			}
			</Route>
		</Switch>
	)
};
export default Routes;
