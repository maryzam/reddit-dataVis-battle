
import * as d3 from "d3";

const offset = 20;
const visibilityLine = 6;

export function renderMagnitudes(selector, data) { 

	const ph = d3.select(selector);
    const size = ph.node().getBoundingClientRect();

    const tooltip = d3.select(".tooltip");
    const container = ph.append("svg")
                .attr("width", size.width)
                .attr("height", size.height)
            .append("g")
                .attr("class", "star-magnitudes")
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

    const gradient = getGradient(container, size, scaleMagnitude);
    bars
        .append("line")
            .attr("x1", function(d) { return scaleMagnitude(d.Magnitudes.Min); })
            .attr("x2", function(d) { return scaleMagnitude(d.Magnitudes.Max); })
            .style("stroke", `url(#${gradient})`);

    const scaleSize = d3.scaleLinear()
                    .domain([
                        d3.max(data, function(d) { return d.BrightestStar.Magnitude; }),
                        d3.min(data, function(d) { return d.BrightestStar.Magnitude; })
                    ])
                    .range([2, 7])
                    .clamp(true);
    bars
        .append("circle")
            .attr("class", function(d) { 
                return notBrightestAndNearest(d) ? "nearest": "both"; })
            .attr("cx", function(d) { return scaleMagnitude(d.NearestStar.Magnitude); })
            .attr("r", function(d) { return scaleSize(d.NearestStar.Magnitude); });
    bars
        .filter(notBrightestAndNearest)
        .append("circle")   
            .attr("class", "brightest")
            .attr("cx", function(d) { return scaleMagnitude(d.BrightestStar.Magnitude); })
            .attr("r", function(d) { return scaleSize(d.BrightestStar.Magnitude); });
    
    container
        .append("line")
            .attr("x1", scaleMagnitude(visibilityLine))
            .attr("x2", scaleMagnitude(visibilityLine))
            .attr("y2", height);

    container
        .on("mouseover", function() { 
            const item = d3.select(d3.event.target);
            let info = item.data()[0];
            let star = null;
            let title = "";
            if (item.classed("nearest")) {
                title = "Nearest Star";
                star = info.NearestStar;
            } else if (item.classed("brightest")) {
                title = "Brightest Star";
                star = info.BrightestStar;
            } else if (item.classed("both")) {
                title = "Brightest & Nearest Star";
                star = info.BrightestStar;
            }
            tooltip
                .style("display", "block")
                .html(
                    `<p>${title} in ${info.FullName}</p>
                    <p><small>Name:</small> ${star.Name || "-"}</p>
                    <p><small><strong>Distance:</strong> ${star.Dist.toFixed(2)}</small></p>
                    <p><small><strong>Magnitude:</strong> ${star.Magnitude.toFixed(2)}</small></p>`
                ); 
        })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function() {
            const { pageX, pageY } = d3.event;
            tooltip
                .style("top", `${pageY + 5}px`)
                .style("left", `${pageX + 5}px`);
        });
}

function getGradient(container, size, scaleMagnitude) {
    const gradientName = "visible-range";
    const minMagnitude = scaleMagnitude.domain()[0];
    const maxMagnitude = scaleMagnitude.domain()[1];
    container
        .append("linearGradient")
            .attr("id", gradientName)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("x2", "100%")
        .selectAll("stop")
            .data([
                { magnitude: minMagnitude, color: "white" },
                { magnitude: 1, color: "white" },
                { magnitude: visibilityLine, color: "#777" },
                { magnitude: visibilityLine, color: "#333" },
                { magnitude: maxMagnitude, color: "#333" },
            ]).enter()
        .append("stop")
            .attr("offset", function(d) { return (100 * scaleMagnitude(d.magnitude) / size.width) + "%"; })
            .attr("stop-color", function(d) { return d.color; });
    return gradientName;
}

function notBrightestAndNearest(d) {
    return d.BrightestStar.Name !== d.NearestStar.Name ||
        d.BrightestStar.Magnitude !== d.NearestStar.Magnitude ||
        d.BrightestStar.Distance !== d.NearestStar.Distance;
}