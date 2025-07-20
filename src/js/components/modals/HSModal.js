import _ from 'lodash';
import { Fragment, useState, useEffect } from 'react';

import TextField from '@ui/TextField';

import Hooks from '@/hooks';
import Icon from '@ui/Icon';

const HSModal = ({ title, onSubmit, HSKlasifikacije, selectedHSClassifications, handleClose, selectAny }) => {
    const i18n = Hooks.useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [classifications, setClassifications] = useState(HSKlasifikacije);
    const allClassifications = HSKlasifikacije;
    const [selectedClassifications, setSelectedClassifications] = useState(selectedHSClassifications ? selectedHSClassifications : []);

    const search = () => {
        if (searchTerm === '') {
            setClassifications(allClassifications);
            return
        }
        const st = searchTerm.toLowerCase();
        let hsc = [...allClassifications];
        const matchingL1Opis = _.filter(hsc, c => c.opis.includes(st));

        const matchingL2Opis = _.filter(hsc, c => c.children.find(c1 => c1.opis.toLowerCase().includes(st)));

        const matchingL3Opis = _.filter(hsc, c => c.children.find(c1 => c1.children.find( c2 => c2.opis.toLowerCase().includes(st))));

        const matchingL4Opis = _.filter(hsc, c => c.children.find(c1 => c1.children.find( c2 => c2.children.find( c3 => c3.opis.toLowerCase().includes(st)))));
        
        let allMatching = [...matchingL1Opis]
        
        for (let e of matchingL2Opis) {
            var index = allMatching.findIndex( x => x.id == e.id );
            if (index === -1) {
                allMatching.push(e)
            }
        }
        for (let e of matchingL3Opis) {
            var index = allMatching.findIndex( x => x.id == e.id );
            if (index === -1) {
                allMatching.push(e)
            }
        }
        for (let e of matchingL4Opis) {
            var index = allMatching.findIndex( x => x.id == e.id );
            if (index === -1) {
                allMatching.push(e)
            }
        }

        setClassifications([...allMatching]);
    }

    useEffect(() => {
        if (searchTerm === '') {
            setClassifications(allClassifications);
            return
        }
    }, [searchTerm])

    const handleToggleClassification = classification => {
        let currentClassifications = [...selectedClassifications];
        if (currentClassifications && currentClassifications.length > 0 && _.find(currentClassifications, c => c.hs?.id === classification.id)) {
            setSelectedClassifications(_.filter(currentClassifications, c => c.hs?.id !== classification.id));
        } else {
            setSelectedClassifications([...selectedClassifications, { godisnja_kolicina: null, hs: classification}])
        }
    }

    const renderHSClassifications = hs => {
        return (
        <div className="h-full w-full tree-container">
            <ul className="tree h-full">
                {_.map(hs, n => (
                    <li key={'l1' + n.id}>
                        <input type="checkbox" id={'l1' + n.id} />
                        <label className="tree_label" htmlFor={'l1' + n.id}>{i18n(n.opis).substring(0, 170)}{n.opis.length > 170 ? '...' : ''}</label>
                        <span className="float-right">{n.id}</span>
                        <ul>
                            {_.map(n.children, n2 => (
                                <li key={'l2' + n2.id}>
                                    <input type="checkbox" id={'l2' + n2.id} />
                                    <label htmlFor={'l2' + n2.id} className="tree_label">{i18n(n2.opis).substring(0, 170)}{n2.opis.length > 170 ? '...' : ''}</label>
                                    {selectAny ? (
                                        <>
                                            <span className={'float-right'}>
                                                <span >{n2.id}</span>
                                                <span className="ml-8 text-xl text-orange cursor-pointer float-right" onClick={() => handleToggleClassification(n2)}>
                                                    {_.find(selectedClassifications, c => c.hs?.id === n2.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                </span>
                                            </span>
                                        </>
                                        ) : (
                                            <span className={selectAny ? 'float-right' :'float-right'}>{n2.id}</span>
                                        )
                                    }
                                    <ul>
                                        {_.map(n2.children, n3 => (
                                            <li className={n3.children && n3.children.length > 0 ? ('') : ('final-level')} key={'l3' + n3.id}>
                                                {n3.children && n3.children.length > 0 ? (
                                                    <>
                                                        <input type="checkbox" id={'l3' + n3.id} />
                                                        <label htmlFor={'l3' + n3.id} className="tree_label">{i18n(n3.opis).substring(0, 170)}{n3.opis.length > 170 ? '...' : ''}</label>
                                                        {selectAny ? (
                                                            <>
                                                                <span className="float-right">
                                                                    <span >{n3.id}</span>
                                                                    <span className="ml-8 text-xl text-orange cursor-pointer float-right" onClick={() => handleToggleClassification(n3)}>
                                                                        {_.find(selectedClassifications, c => c.hs?.id === n3.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                                    </span>
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span className={selectAny ? 'float-right' :'float-right'}>{n3.id}</span>
                                                        )}
                                                        <ul>
                                                            {_.map(n3.children, n4 => (
                                                                <li key={'l4' + n4.id}>
                                                                    {n4.children && n4.children.length > 0 ? (
                                                                        <>
                                                                            <input type="checkbox" id={'l4' + n4.id} />
                                                                            <label htmlFor={'l4' + n4.id} className="tree_label">{i18n(n4.opis).substring(0, 170)}{n4.opis.length > 170 ? '...' : ''}</label>

                                                                            {selectAny ? (
                                                                                <>
                                                                                    <span className="float-right">
                                                                                        <span >{n4.id}</span>
                                                                                        <span className="ml-8 text-xl text-orange cursor-pointer float-right" onClick={() => handleToggleClassification(n4)}>
                                                                                            {_.find(selectedClassifications, c => c.hs?.id === n4.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                                                        </span>
                                                                                    </span>
                                                                                </>
                                                                                ) : (
                                                                                    <span className={selectAny ? 'float-right' :'float-right'}>{n4.id}</span>
                                                                                )
                                                                            }
                                                                            <ul>
                                                                                {_.map(n4.children, n5 => (
                                                                                    <li className="final-level" key={'l5' + n5.id}>
                                                                                        <div className="flex flex-row">
                                                                                            <div>{i18n(n5.opis).substring(0, 170)}{n5.opis.length > 170 ? '...' : ''}</div>
                                                                                            <div className="ml-auto">{n5.id}</div>
                                                                                            <div className="ml-8 text-xl text-orange cursor-pointer" onClick={() => handleToggleClassification(n5)}>
                                                                                                {_.find(selectedClassifications, c => c.hs?.id === n5.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                                                            </div>
                                                                                        </div>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </>
                                                                    ) : (
                                                                        <li className="final-level" id={'l4'+n4.id} >
                                                                            <div className="flex flex-row">
                                                                                <div>{i18n(n4.opis).substring(0, 170)}{n4.opis.length > 170 ? '...' : ''}</div>
                                                                                <div className="ml-auto">{n4.id}</div>
                                                                                <div className="ml-8 text-xl text-orange cursor-pointer" onClick={() => handleToggleClassification(n4)}>
                                                                                    {_.find(selectedClassifications, c => c.hs?.id === n4.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                ) : (
                                                    <div key={'l3'+n3.id}>
                                                        <div className="flex flex-row">
                                                            <div>{i18n(n3.opis).substring(0, 170)}{n3.opis.length > 170 ? '...' : ''}</div>
                                                            <div className="ml-auto">{n3.id}</div>
                                                            <div className="ml-8 text-xl text-orange cursor-pointer" onClick={() => handleToggleClassification(n3)}>
                                                                {_.find(selectedClassifications, c => c.hs?.id === n3.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>)
    }

	return (
		<Fragment>
			<div className="mt-10 mx-12 font-bold text-xl">{i18n(title)}</div>
            <div className="flex flex-row w-full mx-12 mt-8">
                <TextField
                    className={'nace-search-field vtk-seller-field-input'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button onClick={search} className="button nace-search-button login-button">
                    {i18n('Pretraga')}
                </button>
            </div>
            {classifications && classifications.length > 0 ? (
                <div className="mx-12 mt-8">{renderHSClassifications(classifications)}</div>
            ) :
            (
                <div className="text-xl text-greyText text-center mx-12 mt-20">{i18n('Nema rezultata pretrage')}</div>
            )}
            <div className="flex flex-row mt-10 mb-10 mx-12">
                <button className="button signup-button mr-auto" onClick={handleClose}>
                    {i18n('Odustanite')}
                </button>
                <button className="button login-button ml-auto" onClick={() => {
                        onSubmit(selectedClassifications);
                        handleClose();
                    }}>
                    {i18n('Sačuvajte')}
                </button>
            </div>
		</Fragment>
	);
};
export default HSModal;
