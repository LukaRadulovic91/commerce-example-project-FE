import { Component } from 'react';
import _ from 'lodash';
import minidash from '@/modules/minidash';
import { connect } from 'react-redux';

import Icon from '@ui/Icon';

class MultipleSelect extends Component {

	constructor(props) {
		super(props);
		this._node = null;
		this._searchRef = null;

		this.state = {
			search: '',
			collapsed: true,
		};

		this.setNodeRef = ref => (this._node = ref);
		this.setSearchRef = ref => (this._searchRef = ref);
	}


	componentDidMount() {
		document.addEventListener("click", this.handleClickOutside, false); 
	}

	componentWillUnmount() { 
		document.removeEventListener("click", this.handleClickOutside, false); 
	}

	handleClickOutside = (e) => {
		if (this._node.contains(e.target)) {
			return;
		}

		this.setState({
			collapsed: true,
		});
	}

	handleOptionClick = option => {
		const { optionKey, onChange, selectedOptions } = this.props;
		const optionExists =
			_.find(selectedOptions, selected => selected[optionKey] === option[optionKey]) !== undefined;

		let newSelectedOptions;
		if (!optionExists) {
			newSelectedOptions = [...selectedOptions, option];
		} else {
			newSelectedOptions = _.filter(
				selectedOptions,
				selectedOpt => selectedOpt[optionKey] !== option[optionKey]
			);
		}

		onChange(newSelectedOptions);
		if (this.state.search.length > 0) {
			this.setState({
				search: '',
			});
		}
	};

	handleSearch = e => {
		this.setState({
			search: e.target.value.toLowerCase(),
		});
	};


	handleShowItems = () => {
		this.setState(prevState => ({
			collapsed: !prevState.collapsed,
		}));
	};

	handleHideSelector = e => {
		if (!this.state.collapsed) {
			return;
		}

		if (e?.stopPropagation) {
			e.stopPropagation();
		}
		if (this._searchRef !== null) {
			this._searchRef.current.value = '';
		}
		this.setState({
			search: '',
			collapsed: false,
		});
	};

	render() {
		const { i18n, optionKey, optionName, options, selectedOptions, showSelectedFirst } = this.props;
		const { search } = this.state;

		let optionsToShow =
			search.length > 0
				? _.filter(this.props.options, option => option[optionName].toLowerCase().indexOf(search) >= 0)
				: this.props.options;

		if (!_.isEmpty(optionsToShow)) {
			if (showSelectedFirst && !_.isEmpty(selectedOptions)) {
				optionsToShow = _.concat(optionsToShow).sort((a, b) => {
					const i1 = _.findIndex(selectedOptions, s => s[optionKey] === a[optionKey]);
					const i2 = _.findIndex(selectedOptions, s => s[optionKey] === b[optionKey]);
					if (i1 != i2) {
						return i2 - i1;
					}
					return a[optionName].localeCompare(b[optionName]);
				});
			} else {
				optionsToShow = _.concat(optionsToShow).sort((a, b) => a[optionName].localeCompare(b[optionName]));
			}
		}

		return (
			<div className={this.props.className}>
				<div className={'dropdown-combobox unselectable w-full ' + (this.state.collapsed ? 'collapsed' : '')} ref={this.setNodeRef} >
					{!this.state.collapsed && (
						<input
							type="text"
							className="relative w-full"
							name="search"
							placeholder={i18n('Pretraga')}
							value={search}
							onChange={this.handleSearch}
							ref={this.setSearchRef}
							autoComplete="nope"
						/>
					)}
					<div className="dropdown-combobox-head relative" onClick={this.handleHideSelector}>
						{this.state.collapsed && (
							<div
								onClick={this.handleHideSelector}
								className={minidash.cs(
									'dropdown-combobox-item current',
									this._searchRef?.current?.value.length > 0 && 'invisible',
								)}
							>
							{this.props.label ? this.props.label : i18n('Izaberite jedan ili više')}
						</div>)}
						<div
							className="absolute top-0 right-0 h-full flex items-center px-3 cursor-pointer"
							onClick={this.handleHideSelector}
						>
							<Icon icon="angle-down" />
						</div>
					</div>
					<div className={'z-50 custom-vertical-scrollbar dropdown-combobox-items absolute ' + (this.state.collapsed ? 'invisible' : '')}>
						{_.map(optionsToShow, (option, index) => (
							<div key={index} className="dropdown-combobox-item" onClick={() => this.handleOptionClick(option)}>
								<input
									type="checkbox"
									checked={
										_.find(selectedOptions, selectedOpt => selectedOpt[optionKey] === option[optionKey]) !== undefined
									}
									readOnly
								/>
								<span className="ml-2">{option[optionName]}</span>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
}

export default connect(state => ({
	i18n: state.i18n,
}))(MultipleSelect);
