import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private host;
    private reactRoot;
    private formattingSettings;
    private formattingSettingsService;
    private selectionManager;
    constructor(options: VisualConstructorOptions);
    private getAccessToken;
    private getReportId;
    private handleContextMenu;
    update(options: VisualUpdateOptions): Promise<void>;
    getFormattingModel(): powerbi.visuals.FormattingModel;
}
