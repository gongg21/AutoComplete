import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useFocus, useFloating, useInteractions, autoUpdate }from '@floating-ui/react';
import { Option } from './App';
import { Spinner } from './assets/Spinner';

const AutoComplete = (props: {
    description?: string,
    disabled?: boolean,
    filterOptions?: (filter: string, options: Option[]) => Option[],
    label?: string,
    loading: boolean,
    multiple?: boolean,
    onChange?: (selected: Option | Option[]) => void,
    onInputChange?: () => void,
    options: Option[],
    placeholder?: string,
    renderOption?: (handleSelect: (selected?: Option) => void, selectedOptions: Option | Option[], option?: Option, index?: number) => JSX.Element,
    value: Option[] | Option
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isClicked, setIsClicked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedOption, setFocusedOption] = useState<number | null>(null);
    const [filteredOptions, setFilteredOptions] = useState<Option[]>(props.options);
    const [selectedOptions, setSelectedOptions] = useState<Option[] | Option>(props.value);
    const {refs, floatingStyles, context} = useFloating({
        strategy: 'fixed',
        open: isClicked,
        onOpenChange: setIsClicked,
        whileElementsMounted: autoUpdate,
    });
    const focus = useFocus(context)
    const {getReferenceProps, getFloatingProps} = useInteractions([
        focus,
    ]);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const defaultFilterOptions = (filter: string) => {
        setFilteredOptions(props.options.filter(option => {
                if (typeof(option) === 'string') {
                    return option.toLowerCase().includes(filter.toLowerCase());
                } else {
                    return option.label.toLowerCase().includes(filter.toLowerCase());
                }
            })
        );
    }
    
    const defaultRenderOption = (option?: Option, index?: number) => {
        const item = option ? typeof(option) == 'string' ? option : option.label : 'No results were found'
        return (
        <div 
            key={index}
            ref={(el) => index && (optionRefs.current[index] = el)}
            onClick={() => handleValueChange(option)}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => index && setFocusedOption(index)}
            className={"flex flex-row cursor-pointer pt-2 pb-2 hover:bg-blue-100 items-center justify-between "
                + (index && focusedOption != null && index == focusedOption ? 'bg-blue-100' : 'bg-gray-50')}
        >
            <p className="font-sans font-s text-gray-500 justify-center pl-3">{item}</p>
            { option &&
            <div
                className="flex items-center justify-end w-full"
            >
                <input
                    type="checkbox"
                    className="cursor-pointer form-checkbox h-7 w-7 text-gray-600 rounded border-gray-300 focus:ring-gray-500"
                    checked={Array.isArray(selectedOptions) ? selectedOptions.includes(option) : selectedOptions == option}
                />
            </div>
            }
        </div>
        )
    }
    
    const handleInputChange = () => {
        if (props.onInputChange) props.onInputChange();
        if (props.filterOptions) props.filterOptions(searchTerm, props.options);
        else defaultFilterOptions(searchTerm);
    }
    
    const handleValueChange = (selected?: Option) => {
        if (!selected) return;
        let newSelected;
        if (Array.isArray(selectedOptions)) {
            if (selectedOptions.includes(selected)) {
                newSelected = selectedOptions.filter(option => option != selected)
            } else {
                newSelected = [...selectedOptions, selected]
            }
            setSelectedOptions(newSelected);
        } else {
            if (selectedOptions == selected) setSelectedOptions('');
            else setSelectedOptions(selected);
        }
    }
    
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key == 'ArrowDown') {
            event.preventDefault();
            setFocusedOption(prevIndex =>
                prevIndex == null || prevIndex == filteredOptions.length - 1
                ? 0
                : prevIndex + 1
            );
        } else if (event.key == 'ArrowUp') {
            event.preventDefault();
            setFocusedOption(prevIndex =>
                prevIndex == null || prevIndex == 0
                ? filteredOptions.length - 1
                : prevIndex - 1
            );
        } else if (event.key == 'Enter' && focusedOption != undefined) {
            event.preventDefault();
            handleValueChange(filteredOptions[focusedOption]);
        } else if (event.key == 'Escape') {
            setIsClicked(false);
            setFocusedOption(null);
        }
    }
    
    useEffect(() => {
        if (props.loading) {
            setIsLoading(true);
            const loadingTimeout = setTimeout(() => {
                    handleInputChange();
                    setIsLoading(false);
                }, 1000);
            return () => clearTimeout(loadingTimeout);
        } else {
            handleInputChange();
        }
    }, [searchTerm, props.options, props.filterOptions]);
    
    useEffect(() => {
        if (focusedOption !== null && optionRefs.current[focusedOption]) {
        optionRefs.current[focusedOption]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
        }
    }, [focusedOption]);

    
    return (
        <div className="flex flex-col p-5 border-solid border-2 rounded-lg shadow-lg bg-white w-96">
            {props.label && <label className="font-xl font-bold text-gray-400">{props.label}</label>}
            <div 
                className="flex flex-row border-solid border-2 rounded p-1 mt-1 mb-1"
                style={isClicked ? {borderColor: 'blue'} : undefined}
                ref={refs.setReference}
                {...getReferenceProps()}
            >
                <input
                    style={{outline:'none'}}
                    className="text-gray-500"
                    disabled={props.disabled}
                    placeholder={props.placeholder}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => handleKeyDown(e)}
                    value={searchTerm}
                />
                {isLoading &&
                     <div className="flex items-center justify-end w-full mr-1">
                        <Spinner />
                    </div>
                }
            </div>
            
            {isClicked &&
                <div
                    ref={refs.setFloating}
                    style={{...floatingStyles, width:'340px'}}
                    {...getFloatingProps()}
                    className="bg-white shadow-xl border-solid border-2 rounded-lg max-h-60 overflow-auto mt-1"
                >
                    {filteredOptions.length > 0 ?
                        (filteredOptions.map((option, index) => (
                            props.renderOption 
                            ? props.renderOption(handleValueChange, selectedOptions, option, index)
                            : defaultRenderOption(option, index)
                        ))) : (
                            props.renderOption 
                            ? props.renderOption(handleValueChange, selectedOptions)
                            : defaultRenderOption()
                        )
                    }
                </div>
            }
            {props.description && <p className="font-s text-gray-400">{props.description}</p>}
        </div>
    );
}

export default AutoComplete;
