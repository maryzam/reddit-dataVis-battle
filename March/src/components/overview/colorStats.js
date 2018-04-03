
import * as d3 from "d3";
import VizWithTooltip from "./VizWithTooltip";

const gradientName = "color-gradient";
const animDuration = 400;
const margin = 20;
const initHeight = 20;

class ColorStats extends VizWithTooltip {

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

	    this.prepareContainer(ph);
	    this.prepareGradient(ph);

	    this.initViz();
	}

	prepareContainer(ph) {
	  	this.container = ph.append("svg")
				    		.attr("width", this.size.width)
				    		.attr("height", this.size.height)
				    	.append("g")
				    		.attr("class", "star-colors");
	}

	prepareGradient(ph) {

		const gradient = this.container
		 	.append("defs")
		 	.append("linearGradient")
		 		.attr("id", gradientName)
		 		.attr("gradientUnits", "userSpaceOnUse")
		 		.attr("x1", 0).attr("y1", "100%")
	      		.attr("x2", 0).attr("y2", 0);

		const stops = this.scaleColors.domain()
			.map((d) => {
				const frac = 1 - this.scaleY(d) / this.size.height;
			 	return {
			 		offset: (100 * frac).toFixed(0) + "%",
			 		color: this.scaleColors(d)
			 	};
		 	});

		 gradient
		 	.selectAll("stop")
		 		.data(stops).enter()
		 	.append("stop")
	      		.attr("offset", function(d) { return d.offset; })
	      		.attr("stop-color", function(d) { return d.color; });
	}

	setupScales() 
	{
 		this.scaleX = d3.scaleBand()
	    				.domain(this.data.map(function(d) { return d.Name; }))
	    				.range([0, this.size.width])
	    				.padding(0);

	    this.scaleY = d3.scaleLinear()
	    			.domain([
	    				d3.min(this.data, function(d) { return d.Colors.Min; }),
	    				d3.max(this.data, function(d) { return d.Colors.Max; })
	    			])
	    			.range([this.size.height, 0]);

	    this.scaleColors = d3.scaleLinear()
	            .domain([-0.4, 0.5, 1.5, 3.0, 5.0])
	            .range(["#7AF7FF", "#ffffff",  "#FFD230", "#FF8400", "#FF3E00"])
	            .clamp(true);
	}

	initViz() {

		const items = this.container
			 	.selectAll("g")
			 		.data(this.data).enter()
			 	.append("g")
				 	.attr("transform", (d) => {	return `translate(${this.scaleX(d.Name)}, 0)`; });

		items
		 	.append("rect")
			 	.attr("y", (this.size.height + initHeight) * 0.5)
			 	.attr("height", initHeight)
			 	.attr("width", this.scaleX.bandwidth())
			 	.attr("rx", 2)
			 	.attr("ry", 2)
			 	.style("fill", `url(#${gradientName})`)
			.on("mouseover", (d) => this.showTooltip(d))
			.on("mouseout", (d) => this.hideTooltip(d))
			.on("mousemove", (d) => this.updateTooltip(d));

		// draw avg line
		const avgLine = d3.line()
					    .x((d) => { return this.scaleX(d.Name) + this.scaleX.bandwidth() * 0.5; })
					    .y((d) => { return this.scaleY(d.Colors.Avg); })
					    .curve(d3.curveMonotoneX);
		this.container
			.append("path")
	    		.datum(this.data) 
	    		.attr("class", "line")
	    		.attr("d", avgLine);
	}

	show() {

		this.container
			 .selectAll("rect")
			 .transition()
			 	.duration(animDuration)
			 	.delay(function(d, i) { return i * 50; })
			 .attr("y", (d) => { return this.scaleY(d.Colors.Max); })
			 .attr("height", (d) => { return this.scaleY(d.Colors.Min) - this.scaleY(d.Colors.Max); })
	}

	getTooltipLabel(d) {
		return (
	    	`<p>${d.FullName}</p>
	    	<p><small>Star's Color Indices:</small></p>
	    	<p><small><strong>Min</strong> ${d.Colors.Min.toFixed(2)}</small></p>
	    	<p><small><strong>Max</strong>  ${d.Colors.Max.toFixed(2)}</small></p>
	    	<p><small><strong>Avg</strong>  ${d.Colors.Avg.toFixed(2)}</small></p>`
		);
	}
};

export default ColorStats;