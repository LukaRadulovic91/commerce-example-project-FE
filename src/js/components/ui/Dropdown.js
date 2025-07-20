import _ from 'lodash';
import minidash from '@/modules/minidash';
import { Children, forwardRef, useState, useRef, useEffect, cloneElement } from 'react';
import Hooks from '@/hooks';

import Icon from '@ui/Icon';

function escapeRegex(string) {
	return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
}

const getChildrenString = elem => {
	let result = '';
	Children.forEach(elem.props.children, c => {
		if (typeof c === 'string') {
			result += c + ' ';
		} else if (c?.props) {
			// check only down to depth of 2
			Children.forEach(c.props.children, c2 => {
				if (typeof c2 === 'string') {
					result += c2 + ' ';
				}
			});
		}
	});
	return result;
};

// TODO: handle arrow keys
const Dropdown = forwardRef(
	(
		{
			value,
			enableSearch,
			onChange,
			label,
			className,
			comboboxClassName,
			selectedClassName,
			children,
			required,
			defaultValue,
            searchAutoComplete,
		},
		ref
	) => {
		const i18n = Hooks.useI18n();
		const [collapsed, setCollapsed] = useState(false);
		const [query, setQuery] = useState(null);
		const [clonedChildren, setClonedChildren] = useState([]);

		const setDefaultValue = useRef();
		const searchRef = useRef();
		const rootRef = useRef();
		const itemsRef = useRef();
		const heightsRef = useRef([]);
		const selectedItem = useRef();

		const setItemsRef = ref => {
			itemsRef.current = ref;
			if (itemsRef.current && itemsRef?.current?.children.length) {
				let index = 0;
				for (let i = 0; i < itemsRef.current.children.length; i++) {
					const node = itemsRef.current.children[i];
					if (node.hasAttribute('data-dropdown-item')) {
						heightsRef.current[index++] = node.offsetTop;
					}
				}
				
				var isIE = /*@cc_on!@*/false || !!document.documentMode;

				var isEdge = !isIE && !!window.StyleMedia;

				if (selectedItem.current && !isEdge && !isIE) {
					itemsRef.current.scrollTo(
						0,
						heightsRef.current[selectedItem.current.props.index] - itemsRef.current.clientHeight / 2
					);
				}
			}
		};

		useEffect(() => {
			let index = 0;
			const clonedChildren = Children.map(children, item => {
				if (typeof item === 'string' || item?.type != DropdownItem) {
					return item;
				}
				const i = index++;
				return cloneElement(item, {
					index: i,
					style: {
						...item.props.style,
						display: item.props.placeholder && 'none',
					},
					onClick: () => {
						if (item.props.stub) {
							return;
						}
						setCollapsed(false);
						onChange(item.props.value);
						setQuery(null);
						searchRef.current.value = '';
						
						var isIE = /*@cc_on!@*/false || !!document.documentMode;

						var isEdge = !isIE && !!window.StyleMedia;

						if (itemsRef.current && !isEdge && !isIE) {
							itemsRef.current.scrollTo(0, heightsRef.current[i] - itemsRef.current.clientHeight / 2);
						}
					},
				});
			});
			setClonedChildren(clonedChildren);
		}, [children, onChange]);

		let placeholderItem = null;
		const items = Children.map(clonedChildren, item => {
			if (typeof item === 'string' || item?.type != DropdownItem) {
				return item;
			}
			if (item.props.placeholder) {
				placeholderItem = item;
				return item;
			}

			if (item.props.value == null) {
				throw Error('Dropdown item must have `value` attribute: ' + item.props.children);
			}
			if (value != null && item.props.value === value) {
				selectedItem.current = item;
			}
			const childStr = getChildrenString(item);
			const matched = !query || childStr.match(query) || item.props.value.toString().match(query);
			if (!matched) {
				return null;
			}

			const isSelected = item.props.value === value;
			if (isSelected === !!item.props.isSelected) {
				return item;
			}

			return cloneElement(item, {
				isSelected,
				className: minidash.cs(item.props.className, isSelected && 'selected', isSelected && selectedClassName),
			});
		});
		if (!setDefaultValue.current && items.length > 0 && defaultValue !== undefined) {
			setDefaultValue.current = true;
			for (let i = 0; i < items.length; i++) {
				if (defaultValue == items[i].props.value) {
					selectedItem.current = items[i];
					onChange(items[i].props.value);
					break;
				}
			}
		}

		const onShowItems = () => {
			if (searchRef.current.value !== '') {
				setCollapsed(true);
			} else {
				setCollapsed(!collapsed);
			}
			if (searchRef.current) {
				setTimeout(() => {
					searchRef.current.focus();
				});
			}
		};

		const onFilter = e => {
			e.preventDefault();
			const query = e.target.value;
			setQuery(new RegExp(escapeRegex(query), 'i'));
		};
		const onKeyPress = e => {
			// disable enter key
			if (e.keyCode == 13) {
				e.preventDefault();
				if (items.length === 2) {
					const newItem = items[1];
					searchRef.current.value = '';
					selectedItem.current = newItem;
					onChange(newItem.props.value);
				}
				setQuery(null);
				setCollapsed(false);
			} else if (e.key === 'Escape') {
				searchRef.current.value = '';
				setQuery(null);
				setCollapsed(false);
			} else if (e.key === 'ArrowUp') {
				let newItem;
				if (selectedItem.current) {
					for (let i = 0; i < items.length; i++) {
						if (items[i].props.value == selectedItem.current.props.value) {
							if (i > 1) {
								newItem = items[i - 1];
							}
							break;
						}
					}
				}

				if (newItem) {
					selectedItem.current = newItem;
					onChange(newItem.props.value);
				}
			} else if (e.key === 'ArrowDown') {
				let newItem;
				if (items.length > 1) {
					if (selectedItem.current) {
						for (let i = 0; i < items.length; i++) {
							if (items[i].props.value == selectedItem.current.props.value) {
								newItem = items[i + 1];
								break;
							}
						}
					} else {
						newItem = items[1];
					}
				}

				if (newItem) {
					selectedItem.current = newItem;
					onChange(newItem.props.value);
				}
			}
		};

		const onHideSelector = e => {
			if (!collapsed) {
				return;
			}

			if (e?.stopPropagation) {
				e.stopPropagation();
			}
			searchRef.current.value = '';
			setQuery(null);
			setCollapsed(false);
		};

		Hooks.useClickOutside(rootRef.current, collapsed, onHideSelector);

		if (!onChange) {
			throw new Error('Dropdown must have an onChange prop');
		}

		const showPlaceholder = selectedItem?.current == null || (!enableSearch && collapsed);

		return (
			<div className={className}>
				<div
					ref={rootRef}
					className={minidash.cs(
						'dropdown-combobox unselectable w-full',
						collapsed ? 'collapsed' : 'overflow-y-hidden',
						comboboxClassName
                    )}
				>
					<input
						ref={ref}
						value={value ?? ''}
						required={required}
						className="absolute w-full"
						readOnly
                        style={{ opacity: 0 }}
					/>
					<div className="dropdown-combobox-head relative" onClick={onShowItems}>
						<div
							className={minidash.cs(
								'dropdown-combobox-item current',
								searchRef?.current?.value.length > 0 && 'invisible',
								showPlaceholder ? placeholderItem?.props?.className : selectedItem?.current?.props?.className
							)}
						>
							{showPlaceholder
								? placeholderItem?.props.children || i18n(label) || i18n('Izaberite jedan')
								: selectedItem?.current?.props.children || <span>&nbsp;</span>}
						</div>
						<input
							ref={searchRef}
							className={minidash.cs(
								'dropdown-combobox-item dropdown-combobox-search absolute',
								!enableSearch && 'invisible'
							)}
							onChange={onFilter}
							onKeyDown={onKeyPress}
                            autoComplete={searchAutoComplete}
						/>
						<div
							className="absolute top-0 right-0 h-full flex items-center px-3 cursor-pointer"
							onClick={onHideSelector}
						>
							<Icon icon="angle-down" />
						</div>
					</div>
					<div
						ref={setItemsRef}
						className={minidash.cs(
							'z-50 custom-vertical-scrollbar dropdown-combobox-items absolute',
							!collapsed && 'invisible'
						)}
					>
						{items}
					</div>
				</div>
			</div>
		);
	}
);

export const DropdownItem = ({ value, onClick, children, className, style }) => (
	<div
		data-dropdown-item
		data-value={value}
		className={minidash.cs('dropdown-combobox-item', className)}
		style={style}
		onClick={onClick}
	>
		{children}
	</div>
);

Dropdown.Item = DropdownItem;

export default Dropdown;