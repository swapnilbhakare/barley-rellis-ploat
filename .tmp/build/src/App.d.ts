import React from 'react';
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import "./App.css";
import { VisualFormattingSettingsModel } from "./settings";
interface AppProps {
    options: any;
    target: any;
    host: any;
    dataView: DataView;
    formattingSettings: VisualFormattingSettingsModel;
}
declare const App: React.FC<AppProps>;
export default App;
