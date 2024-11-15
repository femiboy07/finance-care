import React, { useRef, useState, useEffect } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { Input } from '../../@/components/ui/input';

// Type for the options, can be string or object with name and _id
type Option = string | { name: string; _id: string, type: string, systemAccount: boolean };

interface CustomSelectProps<TFieldValues extends FieldValues> {
    onSelect: (value: string | Option) => void;
    form: any; // Adjust this based on your form setup
    name: FieldPath<TFieldValues>;
    placeholder: string;
    options: Option[]; // Can be either string[] or Option[]
    field: {
        value: string | Option | any;
        onChange: (value: string | Option) => void;
        onBlur: () => void;
        name: string;
        ref: React.Ref<any>;
    };
}

const CustomSelect = <TFieldValues extends Record<string, any>>({
    options,
    onSelect,
    placeholder,
    field,
    form,
    name,
}: CustomSelectProps<TFieldValues>) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [selectedValue, setSelectedValue] = useState<string | Option>('');
    const [filter, setFilter] = useState<Option[]>(name === 'accountId' ? options : options);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    // Type guard for checking if the option is an object
    const isOptionType = (option: any): option is { name: string; _id: string, type: string, systemAccount: boolean } => {
        return option && typeof option === 'object' && '_id' in option && 'name' in option && 'systemAccount' in option && 'type' in option;
    };

    const handleSelect = (value: string | Option) => {
        setSelectedValue(value);
        setFilterText(typeof value === 'object' ? value.systemAccount !== true ? `${value.name},(${value.type})` : value.name : value);
        form.setValue(
            name,
            typeof value === 'object' ? value && value._id : value // Ensure correct value is sent to the form
        );
        setIsExpanded(false);
        setFilter(options);
        onSelect(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (!isExpanded) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex((prevIndex) => (prevIndex + 1) % filter.length);
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex((prevIndex) => (prevIndex === 0 ? filter.length - 1 : prevIndex - 1));
                break;
            case 'Enter':
                event.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filter.length) {
                    handleSelect(filter[focusedIndex]);
                }
                break;
            case 'Escape':
                setIsExpanded(false);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (focusedIndex >= 0 && inputRef.current) {
            const selectedItem = document.getElementById(`option-${focusedIndex}`);
            selectedItem?.scrollIntoView({ block: 'nearest' });
        }
    }, [focusedIndex]);

    const handleClickOutside = (event: any) => {
        if (inputRef.current && !inputRef.current.contains(event.target)) {
            setIsExpanded(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div
            ref={inputRef}
            role="combobox"
            aria-controls="menu"
            aria-expanded={isExpanded}
            aria-autocomplete='none'
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className={`relative w-full z-[9999] text-sm rotate-0 py-[0.5em] focus:border-black ${isExpanded ? 'border-black border' : ''} focus:border flex justify-between  border min-h-[2.7141429em] ${isExpanded ? 'rounded-bl-none rounded-br-none' : ''}  focus-within:border-black rounded-md  border-gray-300  `}
        >
            <Input name={field.name as string} type="hidden" value={field.value ? (typeof field.value === 'object' ? field.value._id : field.value) : ''} readOnly />

            <Input
                className={`w-full left-0 pl-4 placeholder:text-sm h-full rounded-md top-0 absolute leading-[1.21429em] border-none focus-within:outline-none z-[5]`}
                onClick={() => setIsExpanded(true)}
                autoComplete='off'
                aria-autocomplete='none'
                // name={field.name as string}
                onChange={(e) => {
                    const value = e.target.value.trim();
                    setFilterText(value);
                    form.setValue(name, value)
                    // field.onChange(value)
                    setFilter(options && options.filter(option =>
                        typeof option === 'string'
                            ? option.toLowerCase().includes(value.toLowerCase())
                            : option.name.toLowerCase().includes(value.toLowerCase())
                    ));
                    setFocusedIndex(-1);
                    setIsExpanded(true);
                }}
                value={filterText}
                placeholder={field.value && field.value
                    ? typeof field.value === 'object'
                        ? name === 'accountId' && field.value.systemAccount !== true ? `${field.value.name},(${field.value.type})` : field.value.name
                        : `${field.value}`
                    : placeholder}
                name={field.name}
            />

            <i
                aria-hidden
                onClick={() => setIsExpanded(!isExpanded)}
                className={`absolute right-3 z-[9] top-1/2 transform text-sm text-gray-200 -translate-y-1/2 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
            >
                ▼
            </i>

            {isExpanded && (
                <div
                    style={{ minWidth: 'calc(100% + 2px)' }}
                    className="absolute border-t-0 my-[0px] text-sm -mx-[1px] max-h-[10.6857em] rounded-tl-none rounded-tr-none mt-1 left-0 border border-gray-300 rounded-md bg-white shadow-md p-0 top-[100%] overflow-y-auto z-[5125555]"
                    role="listbox"

                >
                    {filter && filter.length > 0 &&
                        filter.map((item, index) => (
                            <div
                                key={typeof item === 'object' ? item._id : index}
                                id={`option-${typeof item === 'object' ? item._id : index}`}
                                onClick={() => handleSelect(isOptionType(item) ? item : item)}
                                className={`cursor-pointer px-4 text-sm py-2 hover:bg-gray-100 ${selectedValue === item ? 'bg-gray-300 text-black' : 'text-gray-500'} ${focusedIndex === index ? 'bg-gray-200' : ''}`}
                                role="option"
                                aria-selected={selectedValue === item || focusedIndex === index}
                            >
                                {item && typeof item === 'object' ? item.systemAccount !== true ? `${item.name},(${item.type})` : item.name : item}
                            </div>
                        ))
                    }
                    {filter.length === 0 && <div className="px-4 py-2 text-gray-500">No results found</div>}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;