/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import './Select.css';
import { MdArrowDropDown } from 'react-icons/md';

interface SelectProps {
  options: { value?: string; label?: string }[];
  extraClassName?: string;
  placeHolder?: string;
  open?: boolean;
  arrow?: React.ReactNode;
  icon?: React.ReactNode;
  iconLabel?: string;
  position?: string;
  name?: string;
  showSearch?: boolean;
  disabled?: boolean;
  optionLabelKey?: string;
  optionValueKey?: string;
  value: string;
  onChange?: () => void;
  getOptionsService?: (query: object | null) => Promise<{ value: string; label: string }[]>;
  diabledColourClass?: string;
  withPadding?: boolean
}

const Select: React.FC<SelectProps> = ({
    options,
    extraClassName,
    placeHolder,
    name,
    arrow,
    showSearch = false,
    open = false,
    disabled,
    iconLabel = '',
    position = 'bottom',
    optionLabelKey,
    optionValueKey,
    icon,
    value,
    onChange,
    getOptionsService,
    diabledColourClass = '',
    withPadding = false
}) => {
    const wrapperRef = useRef(null);
    const [isOpen, setIsOpen] = useState(open);
    const [searchText, setSearchText] = useState('');
    const [loadedOptions, setLoadedOptions] = useState(false);
    const [optionsData, setOptionsData] = useState(options);
    const found = optionsData.find(opt => opt.value === value);
    // const [selectedLabel, setSelectedLabel] = useState(found?.label || placeHolder || 'Select an option');
    const [selectedLabel, setSelectedLabel] = useState(found?.label);
    const isFetched = useRef(false);

    useEffect(() => {
        if (getOptionsService && !isFetched.current) {
            isFetched.current = true;
            setLoadedOptions(true);
            getOptionsService({ queryParams : { page: 1, page_size: 300 } })
                .then(res => {
                    const { data } = res as unknown as { data: { [key: string]: string }[] };
                    if (data?.length) {
                        // const formattedOptions = data.map(item => ({
                        //     value: item[optionValueKey || 'id'] || '',
                        //     label: item[optionLabelKey || 'name'] || ''
                        // }));
                        const formattedOptions = data.map(item => {
                            const labelKeys = (optionLabelKey || 'name').split(',');
                            const label = labelKeys.map(key => item[key.trim()] || '').join(' ').trim();

                            return {
                                value: item[optionValueKey || 'id'] || '',
                                label
                            };
                        });

                        setOptionsData(formattedOptions);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoadedOptions(false));
        }
    }, [getOptionsService]);

    useEffect(() => {
        if (value === '' || value === undefined || value === null) {
            // setSelectedLabel(placeHolder || 'Select an option');
            setSelectedLabel('');
        } else {
            const found = optionsData.find(opt => opt.value == value);
            // setSelectedLabel(found?.label || placeHolder || 'Select an option');
            setSelectedLabel(found?.label as string);
        }
    }, [optionsData, value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSelect = (val: string, label: string) => {
        if (disabled) return;
        onChange?.({ target: { name, value: `${val}`, label } });
        setSelectedLabel(label);
        setSearchText('');
        setIsOpen(false);
    };
    const filteredOptions = useMemo(() => {
        if (!searchText.trim()) return optionsData;
        return optionsData.filter(opt =>
            opt.label?.toLowerCase().includes(searchText.toLowerCase())
        );
       
    }, [searchText, optionsData]);
    const labelMemo = useMemo(() => selectedLabel, [selectedLabel]);

    return (
    // <div
    //     ref={wrapperRef}
    //     className={`custom-select-wrapper ${disabled ? 'disabled' : ''} ${extraClassName || ''}`}
    // >
    //     <div
    //         className={`custom-select ${isOpen ? 'open' : ''}`}
    //         onClick={() => !disabled && setIsOpen(!isOpen)}
    //     >
    //         <div className="selected">{loadedOptions ? 'Loading...' : labelMemo}</div>
    //         <div className="arrow"><MdArrowDropDown size={22} /></div>
    //     </div>

        //     <div className={`options ${isOpen ? 'visible' : ''}`}>
        //         {optionsData.length > 0 ? (
        //             optionsData.map((option, index) => (
        //                 <div
        //                     key={index}
        //                     className={`option ${option.value == value ? 'selected' : ''}`}
        //                     onClick={() => handleSelect(option.value || '', option.label || '')}
        //                 >
        //                     {option.label}
        //                 </div>
        //             ))
        //         ) : (
        //             !loadedOptions && <div className="option">No options</div>
        //         )}
        //     </div>
        <div
            ref={wrapperRef}
            className={`custom-select-wrapper ${disabled ? 'disabled' : ''} ${extraClassName || ''}`}
        >
            <label
                className={`floating-label ${isOpen || value ? 'active' : ''} ${extraClassName?.includes('error_boundary') || extraClassName?.includes('error') ? 'text-danger' : ''}`}
            >
                {!loadedOptions ? placeHolder : ''} {/* Pass label as prop */}
            </label>
          
            <div
                className={`custom-select ${placeHolder ? 'floating' : ''} ${isOpen ? 'open' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className={`selected ${diabledColourClass ? 'dropdown-toggle' : ''}${icon ? `with-icon ${iconLabel ? 'with-icon-label' : ''} d-flex align-items-center gap-2` : ''}`}>
                    {icon}
                    {iconLabel && <span className="icon-label">{iconLabel}</span>}
                    {loadedOptions ? 'Loading...' : labelMemo}</div>
                <div className="arrow">{arrow || <MdArrowDropDown size={22} />}</div>
            </div>

            {isOpen && <>
        
                <div style={{ bottom: position === 'bottom' ? 'auto' : '100%' }} className={`options visible ${showSearch ? 'search-input' : ''}`}>
                    {
                        showSearch && (
                            <input
                                type="text"
                                // className="search-input"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                placeholder="Search..."
                                autoFocus
                                onClick={e => e.stopPropagation()}
                            />
                        )
                    }

                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                className={`option ${option.value == value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value || '', option.label || '')}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="option">No options</div>
                    )}
                </div>
            
            </>}
        </div>
    );
};

export default React.memo(Select);
