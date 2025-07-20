import Hooks from '@/hooks';
import _ from 'lodash';

import { languages } from '@/models/languages';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import TextField from '@ui/TextField';
import Icon from '@ui/Icon';
import Dropdown from '@ui/Dropdown';

const SearchBar = (props) => {
    const i18n = Hooks.useI18n();
    const { searchString } = useParams()
    const [searchType, setSearchType] = useState(props.defaultSearchType ? props.defaultSearchType : 'product');
    const [searchTerm, setSearchTerm] = useState(searchString && searchString !== "''" ? searchString : '');

    const onKeyPress = e => {
        if (e.keyCode === 13) {
            props.onSearch(searchType, searchTerm)
        }
    };

    return (
        <div className="flex flex-col w-full">
            <div className="header-search-bar ml-0 lg:ml-8 flex flex-row">
                <Dropdown
                    className="header-search-bar-type-dropdown"
                    comboboxClassName="header-search-bar-type-dropdown"
                    onChange={e => setSearchType(e)}
                    required
                    value={searchType}
                >
                    <Dropdown.Item key={'product'} value={'product'} className="">
                        {i18n('Proizvod')}
                    </Dropdown.Item>
                    <Dropdown.Item key={'company'} value={'seller'} className="">
                        {i18n('Kompanija')}
                    </Dropdown.Item>
                </Dropdown>
                <div className="flex flex-row w-full">
                    <TextField
                        placeholder={i18n('Unesite ime proizvoda/usluge za pretragu')}
                        className={'header-search-field'}
                        inputClassName={'header-search-field'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={onKeyPress}
                    />
                    <button onClick={() => props.onSearch(searchType, searchTerm)} className="button header-search-button">
                        <Icon icon="search" />
                    </button>
                </div>
            </div>
        </div>
    );
}

const Header = (props) => {
    const i18n = Hooks.useI18n();
	const history = useHistory();
    const [currentLanguage, setCurrentLanguage] = useState(languages[0])
    const shareURL = 'https://www.digitalnakomora.ba';

    const onLogoClick = () => {
        history.push(`/`);
    }

	return (
        <div className="header-container px-4">
            <div className="w-full ml-auto mr-auto header px-content-mobile md:px-content">
                <div className="header-contact-number">{i18n('Kontaktirajte nas +387 33 843 910 ili ')}<span className="cursor-pointer" ><a href="mailto:office@prefix.ba">{i18n('office@prefix.ba')}</a></span></div>
                <div className={'flex flex-col lg:flex-row'}>
                    <div className="dk-header-logo cursor-pointer ml-auto mr-auto my-8 lg:my-0 lg:mr-0 lg:ml-0" onClick={onLogoClick} />
                    <SearchBar className="ml-auto mr-auto my-2 lg:my-0 lg:mr-0 lg:ml-0" onSearch={props.onSearch} defaultSearchType={props.defaultSearchType} />
                </div>
            </div>
        </div>
	);
};

export default Header;