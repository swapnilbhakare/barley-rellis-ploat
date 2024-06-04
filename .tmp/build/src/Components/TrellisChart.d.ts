import React from 'react';
import ISelectionId = powerbi.visuals.ISelectionId;
interface DataItem {
    yield: number;
    variety: string;
    year: number;
    site: string;
    probability: number;
    selectionId: ISelectionId;
}
declare const TrellisChart: ({ data, options, target, host }: {
    data: DataItem[];
    options: any;
    target: any;
    host: any;
}) => React.JSX.Element;
export default TrellisChart;
