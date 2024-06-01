/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;


class TrellisChartSettings extends FormattingSettingsCard {
    showYAxis = new formattingSettings.ToggleSwitch({
        name: "showYAxis",
        displayName: "Show Y Axis",
        value: true
    });
    showFYAxis = new formattingSettings.ToggleSwitch({
        name: "showFYAxis",
        displayName: "Show FY Axis",
        value: true
    });
    showXAxis = new formattingSettings.ToggleSwitch({
        name: "showXAxis",
        displayName: "Show X Axis",
        value: true
    });

    showYear = new formattingSettings.ToggleSwitch({
        name: "showYear",
        displayName: "Show Year",
        value: true
    });

    name: string = "trellisChartSettings";
    displayName: string = "Trellis Chart DropDownSetting";
    slices: Array<FormattingSettingsSlice> = [this.showYAxis, this.showFYAxis, this.showXAxis, this.showYear];

}

class LicenseKey extends FormattingSettingsCard {

    licenseKey = new formattingSettings.TextInput({
        name: "license",
        displayName: "license",
        placeholder: "",
        value: ""
    });

    name: string = "licenseKey";
    displayName: string = "License Key";


    slices: Array<FormattingSettingsSlice> = [this.licenseKey];

}
/**
* visual settings model class
*
*/
export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    // Create formatting settings model formatting cards
    trellisChartSettings = new TrellisChartSettings()
    licenseKey = new LicenseKey()
    cards = [this.trellisChartSettings, this.licenseKey];
}
