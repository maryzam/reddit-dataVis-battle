
import * as d3 from "d3";
import VizWithTooltip from "./VizWithTooltip"

const animDuration = 1000;

class ConstellationsPack extends VizWithTooltip {

	constructor(selector, source) {
		
		super(selector, source);

		const ph = d3.select(selector);
    	
    	this.size = ph.node().getBoundingClientRect();
		this.tooltip = d3.select(".tooltip");

		this.packData(source);
		this.prepareContainer(ph);
		this.initVis();
	}

	static prepareData(source) 
	{
		const data = source.slice(0);
	    const families = new Set(data.map((d) => d.Family));
	    families
	    	.forEach(function(d) {
	    		if (d && d.length) {
	    			data.push({ Name: d, Family: "All Stars" });
	    		}
		    });

	    data.push({ Name: "All Stars" });
	    return data;
	}

	packData(source) {
	    const data = ConstellationsPack.prepareData(source);
		const stratify = d3.stratify()
	    					.parentId(function(d) { return d.Family; })
	    					.id(function(d) { return d.Name; });

		const pack = d3.pack()
		    .size([
		    	this.size.width - 2,
		    	this.size.height - 2])
		    .padding(3);

		const root = stratify(data)
	    	.sum(function(d) { return d.StarCount; })
	      	.sort(function(a, b) { return b.StarCount - a.StarCount; });

	    pack(root);

	    this.data = root.descendants();
	}

	prepareContainer(ph) {
		this.container = ph.append("svg")
					    	.attr("width", this.size.width)
					    	.attr("height", this.size.height)
					  		.append("g").attr("class", "stars-number"); 
	}

	initVis(ph) {

  		const color = d3.scaleSequential(d3.interpolateMagma).domain([-4, 4]);

	  	const nodes = this.container
	    				.selectAll("g")
	    					.data(this.data).enter()
	    				.append("g")
	      					.attr("transform", function(d) { return `translate(${d.x},${d.y})`; });
	    					
	   	nodes
			.append("circle")
			    .attr("id", function(d) { return "node-" + d.id; })
			    .style("fill", function(d) { return color(d.depth); });

	  	const costellations = nodes
	  		.filter(function(d) { return !d.children; });

	  	costellations
	  		.append("text")
		      	.attr("dy", function(d) { return d.r / 3; })
		      	.text(function(d) { return d.data.Name; })
		      	.style("font-size", function(d){ return `${(d.r - 1)}px`; });

		costellations
			.selectAll("circle")
	  			.attr("class", "const")
				.on("mouseover", (d) => this.showTooltip(d))
			    .on("mouseout", (d) => this.hideTooltip(d))
			    .on("mousemove", (d) => this.updateTooltip(d));

		this.addPackLabels();
	}

	show() {

		this.container
			.selectAll("circle")
				.transition().duration(animDuration)
			    .attr("r", function(d) { return d.r; });

		this.container
			.selectAll(".group")
			.transition().delay(animDuration/2).duration(animDuration)
	     	.style("opacity", 1);
	}

	getTooltipLabel(d) {
		return (
			`<p>${d.data.FullName}</p>
		    <p><strong>${d.data.StarCount}</strong> stars</p>`
		);
	}

	addPackLabels() {

		const startAngle = Math.PI * 0.1;
		const labelArc = d3.arc()
						.innerRadius(function(d) { return (d.r - 5); })
						.outerRadius(function(d) { return (d.r + 10); })
						.startAngle(startAngle)
						.endAngle(function(d) {
							const total = d.data.Name.length;
							const step = 10.0 / d.r;
							return startAngle + (total * step);
						});

	    const groupLabels = this.container
	        			.selectAll(".group")
	    					.data(this.data.filter(function(d) { return !!d.children; })).enter()
	    				.append("g")
	    					.attr("class", "group")
	      					.attr("transform", function(d) { return `translate(${d.x},${d.y})`; })
	      					.style("opacity", 0);

		groupLabels
			.append("path")
		  		.attr("class", "group-arc")
				.attr("id", function(d,i) { return `arc${i}`; })
				.attr("d", labelArc);

		groupLabels
			.append("text")
				.attr("class", "group-label")
				.attr("x", 5) 
				.attr("dy", 7) 
			.append("textPath")
				.attr("xlink:href", function(d,i){ return `#arc${i}`;})
				.text(function(d) { return d.data.Name ;});
	}
}

export default ConstellationsPack;
