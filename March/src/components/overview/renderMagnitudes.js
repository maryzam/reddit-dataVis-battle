
import * as d3 from "d3";

const offset = 20;

export function renderMagnitudes(selector, data) { 

	const ph = d3.select(selector);
    const size = ph.node().getBoundingClientRect();

    const tooltip = d3.select(".tooltip");
    const container = ph.append("svg")
                .attr("width", size.width)
                .attr("height", size.height)
            .append("g")
                .attr("transform", `translate(${offset},${offset})`);

    const width = size.width - offset * 2;
    const height = size.height - offset * 2;

    const scaleConst = d3.scaleBand()
    				.domain(data.map(function(d) { return d.Name; }))
    				.range([0, height])
    				.padding(0.01);

    const minMagnitude = d3.min(data, function(d) { return d.Magnitudes.Min; }); 
    const maxMagnitude = d3.max(data, function(d) { return d.Magnitudes.Max; }); 
    const scaleMagnitude = d3.scaleLinear()
                    .domain([minMagnitude, maxMagnitude])
                    .range([0, width]);

    const bars = container
        .selectAll("g")
            .data(data).enter()
        .append("g")
            .attr("transform", function(d) {
                return `translate(0,${scaleConst(d.Name)})`;
            });

    bars
        .append("line")
            .attr("x1", function(d) { return scaleMagnitude(d.Magnitudes.Min); })
            .attr("x2", function(d) { return scaleMagnitude(d.Magnitudes.Max); })
            .style("stroke", "url(#visible-range)");

    container
        .append("linearGradient")
            .attr("id", "visible-range")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("x2", "100%")
        .selectAll("stop")
            .data([
                { magnitude: minMagnitude, color: "white" },
                { magnitude: 1, color: "white" },
                { magnitude: 6, color: "#777" },
                { magnitude: 6, color: "#333" },
                { magnitude: maxMagnitude, color: "#333" },
            ]).enter()
        .append("stop")
            .attr("offset", function(d) { return (100 * scaleMagnitude(d.magnitude) / size.width) + "%"; })
            .attr("stop-color", function(d) { return d.color; });

    container
        .append("line")
            .attr("x1", scaleMagnitude(6))
            .attr("y1", 0)
            .attr("x2", scaleMagnitude(6))
            .attr("y2", height)
            .style("stroke", "black");
}

