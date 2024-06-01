import React from 'react';
import './dropdown.css';
interface DropdownProps {
    label: string;
    options: {
        key: string;
        value: string;
        text: string;
    }[];
    selectedValue: string;
    onChange: (value: string) => void;
}
declare const Dropdown: React.FC<DropdownProps>;
export default Dropdown;
