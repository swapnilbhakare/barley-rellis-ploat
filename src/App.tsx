// App.tsx
import React, { useState, useEffect } from 'react';
import TrellisChart from './Components/TrellisChart';
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import ISelectionId = powerbi.visuals.ISelectionId;
import  Dropdown from './Components/Dropdown'
import "./App.css"
import { VisualFormattingSettingsModel } from "./settings";
import LicenseKeyValidator  from './Components/LicenseKeyValidator'
import RenderLegend from './Components/RenderLegend'
import * as pbi from 'powerbi-client';

interface DataPoint {
    yield: number;
    variety: string;
    year: number;
    site: string;
    probability: number;

    selectionId: ISelectionId;
}

interface AppProps {
    options: any;
    target: any;
    host: any;
    dataView: DataView;
    formattingSettings:VisualFormattingSettingsModel;
   
}
// Add these lines to define the necessary properties and methods
interface IVisualHostExtended extends powerbi.extensibility.visual.IVisualHost {
    getAccessToken(): Promise<string>;
    getReportId(): Promise<string>;
}

const App: React.FC<AppProps> = ({ options, target, host, dataView,formattingSettings }) => {
  
  
  
    const [data, setData] = useState<DataPoint[]>([]);
    const {  trellisChartSettings ,licenseKey} = formattingSettings;
   
    const [siteMap, setSiteMap] = useState<{ [key: string]: any[] }>({});
    const [varietyMap, setVarietyMap] = useState<{ [key: string]: any[] }>({});
    const [yearMap, setYearMap] = useState<{ [key: string]: any[] }>({});
    const [yieldMap, setYieldMap] = useState<{ [key: string]: any[] }>({});
    const [probabilityMap, setProbabilityMap] = useState<{ [key: string]: any[] }>({});
    const [selectedProbabilityKey, setSelectedProbabilityKey] = useState<string>('');

    const [selectedSiteKey, setSelectedSiteKey] = useState<string>('');
    const [selectedVarietyKey, setSelectedVarietyKey] = useState<string>('');
    const [selectedYearKey, setSelectedYearKey] = useState<string>('');
    const [selectedYieldKey, setSelectedYieldKey] = useState<string>('');
    const transformData = (dataView: DataView): DataPoint[] => {
        const transformedData: DataPoint[] = [];
        const categories = dataView.categorical.categories;
        const values = dataView.categorical.values;
    
        const siteMapTemp: { [key: string]: any[] } = {};
        const varietyMapTemp: { [key: string]: any[] } = {};
        const yearMapTemp: { [key: string]: any[] } = {};
        const yieldMapTemp: { [key: string]: any[] } = {};
        const probabilityMapTemp: { [key: string]: any[] } = {};
    
        categories.forEach((category: any) => {
            if (category.source.roles.site) {
                siteMapTemp[category.source.displayName] = category.values;
            }
            if (category.source.roles.variety) {
                varietyMapTemp[category.source.displayName] = category.values;
            }
            if (category.source.roles.year) {
                yearMapTemp[category.source.displayName] = category.values;
            }
        });
    
        values.forEach((value: any) => {
            if (value.source.roles.yield) {
                yieldMapTemp[value.source.displayName] = value.values;
            }
            if (value.source.roles.probability) {
                probabilityMapTemp[value.source.displayName] = value.values;
            }
        });
    
        setSiteMap(siteMapTemp);
        setVarietyMap(varietyMapTemp);
        setYearMap(yearMapTemp);
        setYieldMap(yieldMapTemp);
        setProbabilityMap(probabilityMapTemp);
    
        const selectedSiteValues = selectedSiteKey ? siteMapTemp[selectedSiteKey] || [] : siteMapTemp[Object.keys(siteMapTemp)[0]] || [];
        const selectedVarietyValues = selectedVarietyKey ? varietyMapTemp[selectedVarietyKey] || [] : varietyMapTemp[Object.keys(varietyMapTemp)[0]] || [];
        const selectedYearValues = selectedYearKey ? yearMapTemp[selectedYearKey] || [] : yearMapTemp[Object.keys(yearMapTemp)[0]] || [];
        const selectedYieldValues = selectedYieldKey ? yieldMapTemp[selectedYieldKey] || [] : yieldMapTemp[Object.keys(yieldMapTemp)[0]] || [];
        const selectedProbabilityValues = selectedProbabilityKey ? probabilityMapTemp[selectedProbabilityKey] || [] : probabilityMapTemp[Object.keys(probabilityMapTemp)[0]] || [];
    
        const categoryLength = selectedSiteValues.length;
        for (let i = 0; i < categoryLength; i++) {
            transformedData.push({
                yield: selectedYieldValues[i],
                variety: selectedVarietyValues[i],
                year: selectedYearValues[i],
                site: selectedSiteValues[i],
                probability: selectedProbabilityValues[i], // Use selectedProbabilityValues here
                selectionId: host.createSelectionIdBuilder()
                    .withCategory(dataView.categorical.categories[0], i)
                    .createSelectionId()
            });
        }
        return transformedData;
    };
    
    
    useEffect(() => {
        if (dataView) {
            const siteKeys = Object.keys(siteMap);
            const varietyKeys = Object.keys(varietyMap);
            const yearKeys = Object.keys(yearMap);
            const yieldKeys = Object.keys(yieldMap);
            const probabilityKeys = Object.keys(probabilityMap); // Add probability keys

            if (selectedSiteKey === '' && siteKeys.length > 0) {
                setSelectedSiteKey(siteKeys[0]);
            }
            if (selectedVarietyKey === '' && varietyKeys.length > 0) {
                setSelectedVarietyKey(varietyKeys[0]);
            }
            if (selectedYearKey === '' && yearKeys.length > 0) {
                setSelectedYearKey(yearKeys[0]);
            }
            if (selectedYieldKey === '' && yieldKeys.length > 0) {
                setSelectedYieldKey(yieldKeys[0]);
            }
            if (selectedProbabilityKey === '' && probabilityKeys.length > 0) {
                setSelectedProbabilityKey(probabilityKeys[0]);
            }
            

            const transformedData: DataPoint[] = transformData(dataView);
            setData(transformedData);
        }
    }, [dataView, selectedSiteKey, selectedVarietyKey, selectedYearKey, selectedYieldKey,selectedProbabilityKey]);

    const handleDropdownChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLSelectElement>) => {
        setter(event.target.value);
    };
    
  

    
    return (
        <div style={{overflowY:"auto"}}>
       
       <div className='container'>
    <div className='dropdonws'>
    <LicenseKeyValidator licenseKey={licenseKey.licenseKey.value} />

    {trellisChartSettings.showFYAxis.value && (
        <Dropdown
            label="FY Axis"
            options={Object.keys(siteMap).map(key => ({ key, value: key, text: key }))}
            selectedValue={selectedSiteKey}
            onChange={setSelectedSiteKey}
        />
    )}
    {trellisChartSettings.showYAxis.value && (
        <Dropdown
            label="Y Axis"
            options={Object.keys(varietyMap).map(key => ({ key, value: key, text: key }))}
            selectedValue={selectedVarietyKey}
            onChange={setSelectedVarietyKey}
        />
    )}
    {trellisChartSettings.showYear.value && (
        <Dropdown
            label="Year"
            options={Object.keys(yearMap).map(key => ({ key, value: key, text: key }))}
            selectedValue={selectedYearKey}
            onChange={setSelectedYearKey}
        />
    )}
    {trellisChartSettings.showXAxis.value && (
        <Dropdown
            label="X Axis"
            options={Object.keys(yieldMap).map(key => ({ key, value: key, text: key }))}
            selectedValue={selectedYieldKey}
            onChange={setSelectedYieldKey}
        />
    )}

   {trellisChartSettings.showProbability.value && (
   <Dropdown
        label="Probability"
        options={Object.keys(probabilityMap).map(key => ({ key, value: key, text: key }))}
        selectedValue={selectedProbabilityKey}
        onChange={setSelectedProbabilityKey}
    />
 )} 


        </div>       
            <RenderLegend data={data} />
 
</div>

       
           

            {/* Trellis Chart */}
            <TrellisChart options={options} target={target} host={host} data={data}  />
        </div>
    );
}

export default App;
