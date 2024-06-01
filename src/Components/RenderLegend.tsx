import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RenderLegend = ({ data }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const legend = svg.append("g")
            .attr("class", "legend")
            // .attr("transform", `translate(${ 200+10 - 350}, 0)`);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
        legend.selectAll(".legend-item")
        .data(Array.from(new Set(data.map(d => d.year))))
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${Number(i) * 120}, 0)`) // Adjust the spacing between items as needed
        .each(function (d) {
            const legendItem = d3.select(this);
            legendItem.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("fill", "#fff")
                .attr("stroke", d => colorScale(d.toString()));
    
            legendItem.append("text")
                .attr("x", 15)
                .attr("y", 5)
                .attr("dy", "0.35em")
                .text(d.toString());
        });
    
    }, [data]);

    return (
        <svg ref={svgRef} width="200" height="50"></svg>
    );
};

export default RenderLegend;
