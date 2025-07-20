import _ from 'lodash';
import { Route, Switch, Redirect } from 'react-router-dom';

import Hooks from '@/hooks';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import 'css/pages/home.css';
import VTKAdmin from './admin/VTKAdmin';
import TopBar from './ui/TopBar';
import BannersAdmin from './admin/BannersAdmin';
import TrendingSliderAdmin from './admin/TrendingSliderAdmin';
import MainSliderAdmin from './admin/MainSliderAdmin';
import FooterAdmin from './admin/FooterAdmin';
import Users from './admin/Users';

const DKAdmin = props => {
	const i18n = Hooks.useI18n();
    const userRole = Hooks.useUserRole();
    const isSuperAdmin = userRole.name === 'Super Admin';
    const isVTKAdmin = userRole.name === 'VTK Admin';
    const canEditContent = userRole.name === 'Admin' || userRole.name === 'Editor' || userRole.name === 'Super Admin';

	return (
		<div >
<           TopBar className="mx-20 max-w-full" />
			<div className="tabs">
                {isVTKAdmin && (
                    <Link className="tab" to="/admin/vtk">
                        {i18n('VTK Admin')}
                    </Link>
                )}
                {isSuperAdmin && (
                    <Link className="tab" to="/admin/users">
                        {i18n('Korisnici')}
                    </Link>
                )}
                {canEditContent && (
                    <>
                        <Link className="tab" to="/admin/dk_slider_main">
                            {i18n('Glavni slider')}
                        </Link>
                        <Link className="tab" to="/admin/dk_slider_trending">
                            {i18n('Proizvodi u trendu slider')}
                        </Link>
                        <Link className="tab" to="/admin/dk_banners">
                            {i18n('Banner reklame')}
                        </Link>
                        <Link className="tab" to="/admin/footer">
                            {i18n('Footer')}
                        </Link>
                    </>
                )}
            </div>
            
            <div className="admin-content-container mx-8">
                <Switch location={props.location}>
                    <Route path="/admin" exact>
                        <Redirect to="/admin/dk_slider_main" />
                    </Route>
                    <Route path="/admin/vtk" component={VTKAdmin} />
                    <Route path="/admin/users" component={Users} />
                    <Route path="/admin/dk_slider_main" component={MainSliderAdmin} />
                    <Route path="/admin/dk_slider_trending" component={TrendingSliderAdmin} />
                    <Route path="/admin/dk_banners" component={BannersAdmin} />
                    <Route path="/admin/footer" component={FooterAdmin} />
                </Switch>
            </div>
		</div>
	);
};

export default DKAdmin;
