import React from 'react';
interface FilterDropdownsProps {
    sites: any;
    varieties: string[];
    years: string[];
    yields: any;
    selectedSite: string;
    selectedVariety: string;
    selectedYear: string;
    selectedYield: string;
    onSiteChange: (site: string) => void;
    onVarietyChange: (variety: string) => void;
    onYearChange: (year: string) => void;
    onYieldChange: (yieldValue: string) => void;
}
declare const FilterDropdowns: React.FC<FilterDropdownsProps>;
export default FilterDropdowns;
