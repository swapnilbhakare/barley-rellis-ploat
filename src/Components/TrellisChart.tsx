import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ITooltipServiceWrapper, createTooltipServiceWrapper, TooltipEventArgs } from 'powerbi-visuals-utils-tooltiputils';
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;


interface DataItem {
    yield: number;
    variety: string;
    year: number;
    site: string;
    selectionId: ISelectionId;
}
const TrellisChart = ({ data, options, target, host }: { data: DataItem[], options: any, target: any, host: any }) => {
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const [width, setWidth] = useState(options.viewport.width - margin.left - margin.right);
    const [height, setHeight] = useState(options.viewport.height - margin.top - margin.bottom);
    const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]); // State to track selected IDs

    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipServiceWrapperRef = useRef<ITooltipServiceWrapper | null>(null);
    const selectionManagerRef = useRef<ISelectionManager | null>(null);
    const [selectedCircle, setSelectedCircle] = useState<DataItem | null>(null);


    useEffect(() => {
        if (!data || !data.length) return;

        renderChart();
        selectionManagerRef.current = host.createSelectionManager();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        return () => {
            // Remove event listener when component is unmounted
            window.removeEventListener('resize', handleResize);
        };
    }, [data, width, height, selectedIds]);

    const handleResize = () => {
        const newWidth = target.clientWidth - margin.left - margin.right;
        const newHeight = target.clientHeight - margin.top - margin.bottom;
        setWidth(newWidth);
        setHeight(newHeight);
    };
    // useEffect(() => {
    //     if (!data || !data.length) return;

    //     renderChart();
    //     selectionManagerRef.current = host.createSelectionManager();
    // }, [data, width, height, selectedIds]);
    const renderChart = () => {
        const svg = d3.select(svgRef.current);
    
        const numericData = data.filter(d => typeof d.yield === 'number');
    
        const x = d3.scaleLinear()
            .domain([0, d3.max(numericData, d => Number(d.yield))!])
            .range([margin.left, width - margin.right]);
    
        const sites = Array.from(new Set(data.map(d => d.site)));
        const varieties = Array.from(new Set(data.map(d => d.variety)));
        const ySite = d3.scaleBand()
            .domain(sites)
            .range([height, 0])
            .padding(0.1);
    
        const yVariety = d3.scaleBand()
            .domain(varieties)
            .range([0, ySite.bandwidth()])
            .padding(0.1);
    
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
        svg.selectAll("*").remove();
    
        if (!tooltipServiceWrapperRef.current) {
            tooltipServiceWrapperRef.current = createTooltipServiceWrapper(host.tooltipService, svgRef.current);
        }
    
        // Add background rectangle for detecting clicks on empty space
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", () => {
                handleBackgroundClick();
            });
    
        svg.selectAll(".site-rect")
            .data(sites)
            .enter()
            .append("rect")
            .attr("class", "site-rect")
            .attr("x", margin.left)
            .attr("y", d => ySite(d)!)
            .attr("width", width - margin.left - margin.right) // Adjusted width to include margin on both sides
            .attr("height", ySite.bandwidth())
            .attr("fill", "#fff")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .on("click", () => {
                handleBackgroundClick();
            });
    
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - 8})`)
            .call(d3.axisBottom(x).ticks(d3.max(data, d => d.yield)! / 10));
    
        svg.append("g")
            .attr("class", "y axis site")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(ySite));
    
        sites.forEach(site => {
            const yVarietyForSite = d3.scaleBand()
                .domain(varieties)
                .range([0, ySite.bandwidth()])
                .padding(0.1);
    
            svg.append("g")
                .attr("class", "y axis variety")
                .attr("transform", `translate(${width - margin.left},${ySite(site)})`)
                .call(d3.axisRight(yVarietyForSite));
        });
    
        const circleColor = (d: DataItem) => {
            if (d.year !== undefined && d.year !== null) {
                const color = colorScale(d.year.toString());
                if (selectedCircle && selectedCircle.selectionId === d.selectionId) {
                    return color;
                }
                return d3.color(color)!.brighter(1).toString();
            }
            return "#ccc";
        };
    
        const circleStrokeWidth = (d: DataItem) => {
            return selectedCircle && selectedCircle.selectionId === d.selectionId ? 3 : 2;
        };
    
        const circle = svg.selectAll(".circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", d => x(d.yield))
            .attr("cy", d => ySite(d.site)! + yVariety(d.variety)! + yVariety.bandwidth() / 2)
            .attr("r", 5)
            .attr("stroke", d => circleColor(d))
            .attr("fill", "#fff")
            .attr("stroke-width", d => circleStrokeWidth(d))
            .on("click", (event, d) => {
                handleDataPointClick(event, d);
            })
            .on('mouseover', function(event, d) {
                const targetElement = event.target as SVGRectElement;
                
                if (tooltipServiceWrapperRef.current) {
                    tooltipServiceWrapperRef.current.addTooltip(
                        d3.select(targetElement),
                        (tooltipEvent: TooltipEventArgs<DataItem>) => {
                            return [
                                { displayName: 'Yield', value: d.yield.toString() },
                                { displayName: 'Variety', value: d.variety },
                                { displayName: 'Year', value: d.year.toString() },
                                { displayName: 'Site', value: d.site }
                            ];
                        },
                        (tooltipEvent: TooltipEventArgs<DataItem>) => d.selectionId
                    );
                }
            });
    };
    

    const handleDataPointClick = async (event: any, data: DataItem) => {
        if (selectionManagerRef.current) {
            const isCtrlPressed = event.ctrlKey || event.metaKey;
            const result = await selectionManagerRef.current.select(data.selectionId, isCtrlPressed);
            setSelectedCircle(data); // Highlight the clicked circle
            setSelectedIds(result.map((item: any) => item.getKey())); // Update selected IDs state
        }
    };

    const handleBackgroundClick = async () => {
        if (selectionManagerRef.current) {
            await selectionManagerRef.current.clear();
            setSelectedIds([]);
        }
    };

    return (
        <svg ref={svgRef} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
            <g transform={`translate(${margin.left},${margin.top})`}>
                {/* Chart content goes here */}
            </g>
        </svg>
    );
};

export default TrellisChart;