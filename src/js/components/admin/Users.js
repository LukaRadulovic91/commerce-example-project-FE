import Hooks from '@/hooks';

import Actions from '@/actions';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { ajaxGET, ajaxPOST } from '@/modules/ajax';
import Persistence from '@/modules/Persistence';
import Icon from '@ui/Icon';
import TextField from '@ui/TextField';
import Checkbox from '../ui/Checkbox';
import Dropdown from '@ui/Dropdown';

const ResultsPerPage = 3;

const Users = () => {
	const i18n = Hooks.useI18n();
    const [newUser, setNewUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [idsToSync, setIdsToSync] = useState(new Set());

    const submitUser = () => {
        let errors = [];
        if (newUser.password.length < 8) {
			errors.push('Lozinka mora biti dugačka najmanje 8 karaktera');
		} else if (newUser.password !== newUser.password_confirmation) {
			errors.push(' Lozinke se ne poklapaju');
		}

		if (
			newUser.email.length < 5 ||
			newUser.email.length > 254 ||
			newUser.email.indexOf('@') === -1 ||
			newUser.email.indexOf('.') === -1
		) {
			errors.push(' Nije validna email adresa');
		}

        if (!newUser.role) {
			errors.push(' Morate izabrati ulogu');
		}


		if (errors.length > 0) {
			let message = '';
			_.forEach(errors, (e, i) => (
				message = message.concat(e, i + 1 < errors.length ? ',' : '')
			));
			Actions.addModal('Greška', message);
		} else {
            let user = newUser;
            user.active = true;
            ajaxPOST({
                api: '/super-admin/users',
                data: user,
                auth: {
                    token: Persistence.get('user_token'),
                },
                infiniteRetries: false,
                success: response => {
                    if (response.success && response.message == "OK") {
                        setUsers([...users, response.data])
                        setNewUser(null);
                    } else {
                        Actions.addModal('Greška', i18n(response.message));
                    }
                },
            });
        }
    }

    const updateUser = (user) => {
        let submitUser = {...user};
        delete(submitUser.password);
        delete(submitUser.id);
        delete(submitUser.email);
        ajaxPOST({
            api: '/super-admin/users/' + user.id,
            data: submitUser,
            auth: {
                token: Persistence.get('user_token'),
            },
            infiniteRetries: false,
            success: response => {
                if (response.success && response.message == "OK") {

                    
                    setIdsToSync(
                        new Set(_.filter([...idsToSync], u => u !== response.data.id))
                    );
                } else {
                    Actions.addModal('Greška', i18n(response.message));
                }
            },
        });
    }

    const handleChangeUserActive = (value, id) => {
        setIdsToSync(idsToSync => new Set(idsToSync.add(id)));
        setUsers((prevUsers) => 
            prevUsers.map((user) => {
                return user.id === id ? {...user, active: value} : user;
            }));
    }

    const handleChangeUserRole = (value, id) => {
        setIdsToSync(idsToSync => new Set(idsToSync.add(id)));
        setUsers((prevUsers) => 
            prevUsers.map((user) => {
                return user.id === id ? {...user, role: value} : user;
            }));
    } 

    useEffect(() => {
        ajaxGET({
            api: '/super-admin/users',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let users = response.data;
                    setUsers(users);
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
        ajaxGET({
            api: '/roles',
            auth: {
                token: Persistence.get('user_token'),
            },
            success: response => {
                if (response.success && response.message == "OK") {
                    let roles = response.data;
                    setRoles(roles);
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
            <div className="mb-6">{i18n('Pregled Korisnika:')}</div>
			<div className="w-full admin-table-wrapper">
				<table className="admin-table">
					<thead>
						<tr>
							<th className="text-left">{i18n('ID')}</th>
							<th className="text-left">{i18n('Email')}</th>
							<th className="text-left">{i18n('Uloga')}</th>
							<th className="text-left">{i18n('Aktivan?')}</th>
							<th className="text-left">{i18n('Sync')}</th>
						</tr>
					</thead>
					<tbody>
						{_.map(users, entry => (
							<tr className={idsToSync?.has(entry.id) ? 'unsynced' : ''} key={entry.id}>
								<td className="w-20 py-3">{entry.id}</td>
								<td className="w-40 py-3">{entry.email}</td>
								<td className="w-32 py-3">
                                    {/* {entry.role.name} */}
                                    <Dropdown
                                        className=""
                                        onChange={(e) => handleChangeUserRole(e, entry.id)}
                                        value={entry.role}
                                        label={entry.role.name}
                                        >
                                        {_.map(roles, role => {
                                            return (
                                                <Dropdown.Item key={role.id} value={role} className="">
                                                    {role.name}
                                                </Dropdown.Item>
                                            )
                                        })}
                                    </Dropdown>
                                    
                                </td>
								<td className="right">
                                    <input
                                        className="ml-auto mr-auto"
                                        id={entry.id}
                                        type="checkbox"
                                        onChange={() => handleChangeUserActive(!entry.active, entry.id)}
                                        checked={entry.active}
                                    />
								</td>
                                <td>
                                    <div className={'button ml-2 py-1 px-4 mt-auto' + (idsToSync?.has(entry.id) ? '' : ' disabled' )}
                                        onClick={idsToSync?.has(entry.id) ? () => updateUser(entry) : null}
                                    >
                                        <Icon icon="edit" />
                                    </div>
                                </td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
            <div className="my-6">
                {i18n('Dodavanje korisnika: ')}
            </div>
            <div className="flex flex-row">
                <div className="mx-2">
                    <div className="vtk-seller-field-label">{i18n('Email*')}</div>
                    <TextField
                        className={'vtk-seller-field-input'}
                        maxLength="254"
                        type="email"
                        value={newUser?.email}
                        onChange={e => setNewUser({...newUser, 
                            email: e.target.value,
                        })}
                    />
                </div>
                <div className="mx-2">
                    <div className="vtk-seller-field-label">{i18n('Password*')}</div>
                    <TextField
                        className={'vtk-seller-field-input'}
                        maxLength="55"
                        type="password"
                        autoComplete="new-password"
                        value={newUser?.password}
                        onChange={e => setNewUser({...newUser, 
                            password: e.target.value,
                        })}
                    />
                </div>
                <div className="mx-2">
                    <div className="vtk-seller-field-label">{i18n('Potvrdite password*')}</div>
                    <TextField
                        className={'vtk-seller-field-input'}
                        maxLength="55"
                        type="password"
                        autoComplete="new-password"
                        value={newUser?.password_confirmation}
                        onChange={e => setNewUser({...newUser, 
                            password_confirmation: e.target.value,
                        })}
                    />
                </div>
                <div className="mx-2">
                    <div className="vtk-seller-field-label">{i18n('Uloga*')}</div>
                    <Dropdown
                        className=""
                        onChange={e => setNewUser({...newUser, 
                            role: e,
                        })}
                        value={newUser?.role}
                        label={newUser?.role?.name}
                        >
                        {_.map(roles, role => {
                            return (
                                <Dropdown.Item key={role.id} value={role} className="">
                                    {role.name}
                                </Dropdown.Item>
                            )
                        })}
                    </Dropdown>
                </div>
                <div className="button ml-2 py-1 px-4 mt-auto"
                    disabled={!newUser}
                    onClick={() => submitUser()}
                >
                    <Icon icon="plus" />
                </div>
            </div>
        </div>
    )
}

export default connect(state => ({
	i18n: state.i18n,
}))(Users);
