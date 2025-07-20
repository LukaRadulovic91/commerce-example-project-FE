import _ from 'lodash';
import { Fragment, useState, useEffect } from 'react';

import TextField from '@ui/TextField';

import Hooks from '@/hooks';
import Icon from '@ui/Icon';

const NACEModal = ({ title, onSubmit, NACEKlasifikacije, selectedNaceClassifications, handleClose, selectAny }) => {
    const i18n = Hooks.useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [classifications, setClassifications] = useState(NACEKlasifikacije);
    const allClassifications = NACEKlasifikacije;
    const [selectedClassifications, setSelectedClassifications] = useState(selectedNaceClassifications ? selectedNaceClassifications : []);

    const search = () => {
        if (searchTerm === '') {
            setClassifications(allClassifications);
            return
        }
        const st = searchTerm.toLowerCase();
        let nc = [...allClassifications];
        const matchingL1Opis = _.filter(nc, c => c.opis.includes(st));

        const matchingL2Opis = _.filter(nc, c => c.children.find(c1 => c1.opis.toLowerCase().includes(st)));

        const matchingL3Opis = _.filter(nc, c => c.children.find(c1 => c1.children.find( c2 => c2.opis.toLowerCase().includes(st))));

        const matchingL4Opis = _.filter(nc, c => c.children.find(c1 => c1.children.find( c2 => c2.children.find( c3 => c3.opis.toLowerCase().includes(st)))));
        
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
        let classifications = [...selectedClassifications];
        if (classifications && classifications.length > 0 && _.find(classifications, c => c.id === classification.id)) {
            setSelectedClassifications(_.filter(classifications, c => c.id !== classification.id));
        } else {
            setSelectedClassifications([...selectedClassifications, classification])
        }
    }
    
    const renderNACEClassifications = nace => {
        return (
        <div className="h-full w-full tree-container">
            <ul className="tree h-full">
                {_.map(nace, n => (
                    <li key={'l1' + n.id}>
                        <input type="checkbox" id={'l1' + n.id} />
                        <label className="tree_label" htmlFor={'l1' + n.id}>{i18n(n.opis)}</label>
                        <span className="float-right">{n.id}</span>
                        <ul>
                            {_.map(n.children, n2 => (
                                <li key={'l2' + n2.id}>
                                    <input type="checkbox" id={'l2' + n2.id} />
                                    <label htmlFor={'l2' + n2.id} className="tree_label">{i18n(n2.opis)}</label>
                                    {selectAny ? (
                                        <>
                                            <span className={'float-right'}>
                                                <span >{n2.id}</span>
                                                <span className="ml-8 text-xl text-orange cursor-pointer float-right" onClick={() => handleToggleClassification(n2)}>
                                                    {_.find(selectedClassifications, c => c.id === n2.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                </span>
                                            </span>
                                        </>
                                        ) : (
                                            <span className={selectAny ? 'float-right' :'float-right'}>{n2.id}</span>
                                        )}
                                    <ul>
                                        {_.map(n2.children, n3 => (
                                            <li key={'l3' + n3.id}>
                                                <input type="checkbox" id={'l3' + n3.id} />
                                                <label htmlFor={'l3' + n3.id} className="tree_label">{i18n(n3.opis)}</label>
                                                {selectAny ? (
                                                <>
                                                    <span className="float-right">
                                                        <span >{n3.id}</span>
                                                        <span className="ml-8 text-xl text-orange cursor-pointer float-right" onClick={() => handleToggleClassification(n3)}>
                                                            {_.find(selectedClassifications, c => c.id === n3.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                        </span>
                                                    </span>
                                                </>
                                                ) : (
                                                    <span className={selectAny ? 'float-right' :'float-right'}>{n3.id}</span>
                                                )}
                                                {n3.children && n3.children.length > 0 ? (
                                                    <ul>
                                                        {_.map(n3.children, n4 => (
                                                            <li className="final-level" key={'l4' + n4.id}>
                                                                <div className="flex flex-row">
                                                                    <div>{i18n(n4.opis)}</div>
                                                                    <div className="ml-auto">{n4.id}</div>
                                                                    <div className="ml-8 text-xl text-orange cursor-pointer" onClick={() => handleToggleClassification(n4)}>
                                                                        {_.find(selectedClassifications, c => c.id === n4.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <li className="final-level" key={'l3' + n3.id}>
                                                        <div className="ml-auto">{n3.id}</div>
                                                        <div className="ml-8 text-xl text-orange cursor-pointer" onClick={() => handleToggleClassification(n3)}>
                                                            {_.find(selectedClassifications, c => c.id === n3.id) ? <Icon icon="check-square" /> : <Icon icon="square" />}
                                                        </div>
                                                    </li>
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
			    <div className="mx-12 mt-8">{renderNACEClassifications(classifications)}</div>
            ) :
            (
                <div className="text-xl text-greyText text-center mx-12 mt-20">{i18n('Nema rezultata pretrage')}</div>
            )}
            <div className="flex flex-row mt-10 mx-12 mb-10">
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
export default NACEModal;
