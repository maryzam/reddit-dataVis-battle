
import * as d3 from "d3";
import VizWithTooltip from "./VizWithTooltip";

const margin = 20;
const animDuration = 200;
const gradientName = "visible-range";

const visibilityLine = 6;

function notBrightestAndNearest(d) {
    return d.BrightestStar.Name !== d.NearestStar.Name ||
        d.BrightestStar.Magnitude !== d.NearestStar.Magnitude ||
        d.BrightestStar.Distance !== d.NearestStar.Distance;
}

class MagnitudeStats extends VizWithTooltip {

    constructor(selector, source) {
        
        super(selector, source);

        const ph = d3.select(selector);
        const size = ph.node().getBoundingClientRect();

        this.data = source;
        this.size = {
            width: size.width - margin * 2,
            height: size.height - margin * 2
        };

        this.setupScales();

        this.prepareContainer(ph, size);
        this.prepareGradient(ph, size);

        this.initViz();
    }

    initViz() {
        const bars = this.container
                        .selectAll("g")
                            .data(this.data).enter()
                        .append("g")
                            .attr("transform", (d) => { return `translate(0,${this.scaleConst(d.Name)})`; })
                            .style("opacity", 0);

        bars
            .append("line")
                .attr("x1", (d) => { return this.scaleMagnitude(d.Magnitudes.Min); })
                .attr("x2", (d) => { return this.scaleMagnitude(d.Magnitudes.Max); })
                .style("stroke", `url(#${gradientName})`);

        bars
            .append("circle")
                .attr("class", (d) => { return notBrightestAndNearest(d) ? "nearest": "both"; })
                .attr("cx", (d) => { return this.scaleMagnitude(d.NearestStar.Magnitude); })
                .attr("r", (d) => { return this.scaleSize(d.NearestStar.Magnitude); });
        bars
            .filter(notBrightestAndNearest)
            .append("circle")   
                .attr("class", "brightest")
                .attr("cx", (d) => { return this.scaleMagnitude(d.BrightestStar.Magnitude); })
                .attr("r", (d) => { return this.scaleSize(d.BrightestStar.Magnitude); });
    
        this.container
            .append("line")
                .attr("x1", this.scaleMagnitude(visibilityLine))
                .attr("x2", this.scaleMagnitude(visibilityLine))
                .attr("y2", this.size.height);
    }

    show() {

        this.container
            .selectAll("g")
            .transition()
                .duration(animDuration)
                .delay(function(d, i) { return i * 25; })
            .style("opacity", 1);

        this.container
            .on("mouseover", (d) => this.showTooltip(d))
            .on("mouseout", (d) => this.hideTooltip(d))
            .on("mousemove", (d) => this.updateTooltip(d));
    }

    setupScales() 
    {
        this.scaleConst = d3.scaleBand()
                    .domain(this.data.map(function(d) { return d.Name; }))
                    .range([0, this.size.height])
                    .padding(0.01);

        this.scaleMagnitude = d3.scaleLinear()
                        .domain([
                            d3.min(this.data, function(d) { return d.Magnitudes.Min; }),
                            d3.max(this.data, function(d) { return d.Magnitudes.Max; })
                        ])
                        .range([0, this.size.width]);

        this.scaleSize = d3.scaleLinear()
                    .domain([
                        d3.max(this.data, function(d) { return d.BrightestStar.Magnitude; }),
                        d3.min(this.data, function(d) { return d.BrightestStar.Magnitude; })
                    ])
                    .range([2, 7])
                    .clamp(true);
    }

    getTooltipLabel(d) {
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
        return (
            `<p>${title} in ${info.FullName}</p>
             <p><small>Name:</small> ${star.Name || "-"}</p>
             <p><small><strong>Distance:</strong> ${star.Dist.toFixed(2)}</small></p>
             <p><small><strong>Magnitude:</strong> ${star.Magnitude.toFixed(2)}</small></p>`
        );
    }

    prepareContainer(ph, originSize) {
        this.container = ph
            .append("svg")
                .attr("width", originSize.width)
                .attr("height", originSize.height)
            .append("g")
                .attr("class", "star-magnitudes")
                .attr("transform", `translate(${margin},${margin})`);
    }

    prepareGradient(ph, originSize) {
        const minMagnitude = d3.min(this.data, function(d) { return d.Magnitudes.Min; }); 
        const maxMagnitude = d3.max(this.data, function(d) { return d.Magnitudes.Max; }); 
        this.container
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
                .attr("offset", (d) => { return (100 * this.scaleMagnitude(d.magnitude) / originSize.width) + "%"; })
                .attr("stop-color", (d) => { return d.color; });
    }
}

export default MagnitudeStats;



