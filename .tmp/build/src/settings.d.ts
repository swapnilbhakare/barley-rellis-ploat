import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import FormattingSettingsCard = formattingSettings.Card;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
declare class TrellisChartSettings extends FormattingSettingsCard {
    showYAxis: formattingSettings.ToggleSwitch;
    showFYAxis: formattingSettings.ToggleSwitch;
    showXAxis: formattingSettings.ToggleSwitch;
    showYear: formattingSettings.ToggleSwitch;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
declare class LicenseKey extends FormattingSettingsCard {
    licenseKey: formattingSettings.TextInput;
    name: string;
    displayName: string;
    slices: Array<FormattingSettingsSlice>;
}
/**
* visual settings model class
*
*/
export declare class VisualFormattingSettingsModel extends FormattingSettingsModel {
    trellisChartSettings: TrellisChartSettings;
    licenseKey: LicenseKey;
    cards: (TrellisChartSettings | LicenseKey)[];
}
export {};
