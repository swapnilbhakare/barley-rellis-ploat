import * as React from 'react';
import * as ReactDOM from 'react-dom';

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import { VisualFormattingSettingsModel } from "./settings";
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import App from './App';



interface IVisualHostExtended extends IVisualHost {
    getAccessToken: () => Promise<string>;
    getReportId: () => Promise<string>;
    createSelectionManager: () => ISelectionManager;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private host: IVisualHostExtended;

    private reactRoot: React.ReactElement<any, any>;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private selectionManager: ISelectionManager;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host as IVisualHostExtended;
        this.selectionManager = this.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();
        this.target = options.element;
        this.handleContextMenu();


    }




    private handleContextMenu() {
        this.target.addEventListener("contextmenu", (event: PointerEvent) => {
            const mouseEvent: MouseEvent = event;
            const dataPoint = {}; // Assuming you have a way to get dataPoint
            this.selectionManager.showContextMenu(dataPoint, {
                x: mouseEvent.clientX,
                y: mouseEvent.clientY,
            });
            mouseEvent.preventDefault();
        });
    }



    public async update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
        const dataView: DataView = options.dataViews[0];

        this.reactRoot = React.createElement(App, {
            options: options,
            target: this.target,
            host: this.host,
            dataView: dataView,
            formattingSettings: this.formattingSettings,

        });

        ReactDOM.render(this.reactRoot, this.target);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }
}
