import React from 'react';
interface DropdownMenuProps {
    label: string;
    options: {
        key: string;
        value: string;
        text: string;
    }[];
    selectedValue: string;
    onChange: (value: string) => void;
}
declare const DropdownMenu: React.FC<DropdownMenuProps>;
export default DropdownMenu;
