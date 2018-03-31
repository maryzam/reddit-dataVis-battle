
import * as d3 from "d3";

export function renderMagnitudes(selector, data) { 


	const ph = d3.select(selector);
    const size = ph.node().getBoundingClientRect();

    const scaleConst = d3.scaleBand()
    				.domain(data.map(function(d) { return d.Name; }))
    				.range([0, size.width])
    				.padding(0.01);

    const magnitudes = getMagnitudeRanges(data); 
    const scaleMagnitude = d3.scaleBand()
                    .domain(magnitudes)
                    .range([size.height, 0])
                    .padding(0.01);

    const scaleFrequency = d3.scaleLog()
                    .domain([1, 100])
                    .range([1, Math.floor(scaleConst.bandwidth())])

    const tooltip = d3.select(".tooltip");
  	const container = ph.append("svg")
	    	.attr("width", size.width)
	    	.attr("height", size.height);

    const bars = container
        .selectAll("g")
            .data(data).enter()
        .append("g")
            .attr("transform", function(d) {
                return `translate(${scaleConst(d.Name)},0)`;
            });

    bars
        .selectAll("circle")
        .data(function(d) { return d.Magnitudes.Ranges; })
            .enter()
        .append("circle")
            .attr("cy", function(d) { console.log(scaleMagnitude(d.Min)); return scaleMagnitude(d.Min); })
            .attr("r", function(d) { return scaleFrequency(d.Frac); })
            .style("fill", "grey")
            .style("fill-opacity", 0.7);
}

function getMagnitudeRanges(data) {
    const magnitudes = new Set();
    data.forEach(function(d) {
        d.Magnitudes.Ranges
            .forEach(function(m) {
                magnitudes.add(m.Min);
            });
    });
    return Array.from(magnitudes);
}