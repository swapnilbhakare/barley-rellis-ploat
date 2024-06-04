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
    probability: number;
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

    const calculateStatistics = (data: DataItem[]): { median: number, q1: number, q3: number, probability: number } => {
        const values = data.map(d => d.yield).sort(d3.ascending);
        const totalProbability = d3.sum(data.map(d => d.probability));
        return {
            median: d3.median(values),
            q1: d3.quantile(values, 0.25),
            q3: d3.quantile(values, 0.75),
            probability: totalProbability / data.length
        };
    };
    
    const computeStatisticsRecursive = (data: DataItem[], siteIndex: number, varietyIndex: number, sites: string[], varieties: string[], stats: Map<string, Map<string, { median: number, q1: number, q3: number, probability: number }>>): void => {
        if (siteIndex >= sites.length) return;
        if (varietyIndex >= varieties.length) {
            computeStatisticsRecursive(data, siteIndex + 1, 0, sites, varieties, stats);
            return;
        }

        const site = sites[siteIndex];
        const variety = varieties[varietyIndex];
        const filteredData = data.filter(d => d.site === site && d.variety === variety);

        if (!stats.has(site)) {
            stats.set(site, new Map());
        }

        stats.get(site)!.set(variety, calculateStatistics(filteredData));

        computeStatisticsRecursive(data, siteIndex, varietyIndex + 1, sites, varieties, stats);
    };

    const renderChart = () => {
        const svg = d3.select(svgRef.current);

        const numericData = data.filter(d => typeof d.yield === 'number');

        const sites = Array.from(new Set(data.map(d => d.site)));
        const varieties = Array.from(new Set(data.map(d => d.variety)));

        const stats = new Map<string, Map<string, { median: number, q1: number, q3: number, probability: number }>>();
        computeStatisticsRecursive(numericData, 0, 0, sites, varieties, stats);

        const sortedSites = sites.sort((a, b) => {
            const medianA = d3.median(Array.from(stats.get(a)!.values()).map(d => d.median));
            const medianB = d3.median(Array.from(stats.get(b)!.values()).map(d => d.median));
            return d3.descending(medianA, medianB);
        });

        const sortedVarieties = varieties.sort((a, b) => {
            const mediansA = Array.from(stats.values()).map(map => map.get(a)?.median).filter(median => median !== undefined);
            const mediansB = Array.from(stats.values()).map(map => map.get(b)?.median).filter(median => median !== undefined);
            const medianA = d3.median(mediansA);
            const medianB = d3.median(mediansB);
            return d3.descending(medianA, medianB);
        });

        const x = d3.scaleLinear()
            .domain([0, d3.max(numericData, d => Number(d.yield))!])
            .range([margin.left, width - margin.right]);

        const ySite = d3.scaleBand()
            .domain(sortedSites)
            .range([height, 0])
            .padding(0.1);

        const yVariety = d3.scaleBand()
            .domain(sortedVarieties)
            .range([0, ySite.bandwidth()])
            .padding(0.1);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        svg.selectAll("*").remove();

        if (!tooltipServiceWrapperRef.current) {
            tooltipServiceWrapperRef.current = createTooltipServiceWrapper(host.tooltipService, svgRef.current);
        }

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", () => {
                handleBackgroundClick();
            });

        svg.selectAll(".site-rect")
            .data(sortedSites)
            .enter()
            .append("rect")
            .attr("class", "site-rect")
            .attr("x", margin.left)
            .attr("y", d => ySite(d)!)
            .attr("width", width - margin.left - margin.right)
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

        sortedSites.forEach(site => {
            const yVarietyForSite = d3.scaleBand()
                .domain(sortedVarieties)
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

                const siteStats = stats.get(d.site);
                const varietyStats = siteStats ? siteStats.get(d.variety) : null;

                if (tooltipServiceWrapperRef.current) {
                    tooltipServiceWrapperRef.current.addTooltip(
                        d3.select(targetElement),
                        (tooltipEvent: TooltipEventArgs<DataItem>) => {
                            const tooltipData = [
                                { displayName: 'Yield', value: d.yield.toString() },
                                { displayName: 'Variety', value: d.variety },
                                { displayName: 'Year', value: d.year.toString() },
                                { displayName: 'Site', value: d.site }
                            ];
                            if (varietyStats) {
                                tooltipData.push(
                                    { displayName: 'Median', value: varietyStats.median.toString() },
                                    { displayName: 'Probability', value: (varietyStats.probability * 100).toFixed(1) + '%' }
                                );
                            }
                            return tooltipData;
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
