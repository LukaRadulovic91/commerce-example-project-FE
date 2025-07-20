import _ from 'lodash';
import { useState, useEffect } from 'react';

import Actions from '@/actions';
import { ajaxPOST, ajaxGET } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Hooks from '@/hooks';
import { Link, useHistory } from 'react-router-dom';
import ReduxState from '@/modules/ReduxState';

import Icon from '@ui/Icon';
import TextField from '@ui/TextField';
import Form from '@ui/Form';
import Dropdown from '@ui/Dropdown';

const UserProfile = props => {
	const i18n = Hooks.useI18n();
	const history = useHistory();
    const [seller, setSeller] = useState(null);
    const userData = Hooks.useUser();
    const userRole = Hooks.useUserRole();

    const SellerProfile = () => {
        return (
            <div className="flex flex-col">
                <div className="user-profile-avatar w-full">
                    <div className="mt-2 mb-4 flex justify-center">
                        <img className="" src={userData.photo_logo?.url} className="inline-block user-avatar" />
                    </div>
                </div>
                <div className="user-profile-label flex flex-row ml-4 mt-4"><div className="user-profile-data">{userData.naziv}</div></div>
                <div className="user-profile-label flex flex-row ml-4"><div className="user-profile-data">{userData.jib}</div></div>
                <div className="user-profile-label flex flex-row ml-4"><div className="user-profile-data">{}</div></div>
                <div className="user-profile-label flex flex-row ml-4"><div className="user-profile-data">{userData.registrant_ime_i_prezime}</div></div>
                <div className="user-profile-label flex flex-row ml-4"><div className="user-profile-data">{userData.email}</div></div>
                <div className="user-profile-label flex flex-row ml-4"><div className="user-profile-data">{userData.telefon}</div></div>
                <div className="user-profile-label flex flex-row ml-4 mt-2">
                    {
                        userData.vtk_forma_korak == 5 ? 
                            <div className="positive-text">{i18n('Podaci o privrednom subjektu su potpuni')}</div> 
                            : 
                            <div className="negative-text">{i18n('Podaci o privrednom subjektu nisu potpuni')}</div>
                    }
                </div>
            </div>
        )
    }

    const BuyerProfile = () => {
        return (
            <div className="flex flex-col">
                <div className="user-profile-avatar w-full">
                    <div className="mt-4 mb-4 flex justify-center">
                        <img className="" src={userData.photo?.url} className="inline-block user-avatar" />
                    </div>
                </div>
                <div className="user-profile-label flex flex-row mt-2 mb-4"><div className="user-profile-data text-2xl font-bold">{userData.ime_i_prezime}</div></div>
                <div className="user-profile-label flex flex-row"><div className="user-profile-data">{userData.email}</div></div>
                <div className="user-profile-label flex flex-row"><div className="user-profile-data">{userData.telefon}</div></div>
            </div>
        )
    }

    const EditProfile = () => {
        if (userRole?.name === "Seller") {
            history.push(`/vtk_form/`);
        } else if (userRole?.name === "Buyer") {
            history.push(`/buyer_profile/`);
        }
    }

	return (
		<div className={'user-profile-container user-profile ' + props.className}>
            <div className="user-profile-header">{i18n('Vaš korisnički profil')}</div>
            {userRole?.name === "Seller" ? (
                <SellerProfile />
            ) : 
            userRole?.name === "Buyer" ? (
                <BuyerProfile />
            ) : (
                <div>{i18n('Administrator')}</div>
            )}

            <div className="flex flex-col mt-auto mb-4 px-4">
                <button className="button w-full login-button mt-6 ml-auto mr-auto" onClick={EditProfile}>
                    {i18n('Uredite svoj profil')}
                </button>
            </div>
		</div>
	);
};
export default UserProfile;
