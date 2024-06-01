import React from 'react';
import './dropdown.css'
interface DropdownProps {
    label: string;
    options: { key: string; value: string; text: string }[];
    selectedValue: string;
    onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, selectedValue, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className='dropdonw-container-group'>
            <label>{label}:</label>
            <select value={selectedValue} onChange={handleChange}>
                {options.map(option => (
                    <option key={option.key} value={option.value}>{option.text}</option>
                ))}
            </select>
        </div>
    );
};

export default Dropdown;
