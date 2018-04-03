
import * as d3 from "d3";
import VizWithTooltip from "./VizWithTooltip";

const ticks = [2, 5, 10, 20, 50, 150, 350, 800];
const animDuration = 200;

class DistanceStats extends VizWithTooltip {

	constructor(selector, source) {
        
        super(selector, source);

        const ph = d3.select(selector);
        const size = ph.node().getBoundingClientRect();

        this.data = source;
        this.size = size;

        this.setupScales();
        this.prepareContainer(ph);
        this.initViz();
    }

    setupScales() {
    	const outerRadius = Math.min(this.size.width, this.size.height) * 0.5 - 10;

  		this.scaleRadius = d3.scaleLog()
  						  .domain([1, 1000])
  						  .range([0, outerRadius]);

  		this.scaleName = d3.scaleBand()
  						.domain(this.data.map((d) => d.Name))
  						.range([-180, 180])
  						.padding(0.01);
    }

    prepareContainer(ph) {
    	const center = {
    		x: this.size.width / 2,
    		y: this.size.height / 2
    	};

		this.container = ph.append("svg")
		    	.attr("width", this.size.width)
		    	.attr("height", this.size.height)
	  		.append("g").attr("class", "star-distances")
	  			.attr("transform", `translate(${center.x},${center.y})`);
    }

    initViz() {

    	this.renderAxis();
    	this.renderChart();
    	this.renderAxisLabels();
    }

    renderAxis() {
		this.container
			.append("g").attr("class", "axis")
			.selectAll("circle")
				.data(ticks).enter()
			.append("circle")
				.attr("r", (d) => { return this.scaleRadius(d); });
    }

    renderChart() {

	  	const dists = this.container
	  		.append("g").attr("class", "chart")
	  		.selectAll("g")
	  			.data(this.data).enter()
	  		.append("g")
	  			.attr("transform", (d) => { return `rotate(${this.scaleName(d.Name)})`; })
	  			.style("opacity", 0);

		dists
	  		.append("line")
	  			.attr("y1", (d) => { return this.scaleRadius(d.Distances.Min); })
	  			.attr("y2", (d) => { return this.scaleRadius(d.Distances.Max); });
	  	dists
	  		.append("text")
	  		.text("★")
		  	.attr("transform", (d) => { return `translate(0,${this.scaleRadius(d.Distances.Avg) + 7 })`; })
		  	.style("opacity", 0);
		  	
		dists
	  		.append("circle")
	  			.attr("cy", (d) => { return this.scaleRadius(d.Distances.Max); })
	  			.attr("r", 2);

		dists
	  		.append("circle")
	  			.attr("cy", (d) => { return this.scaleRadius(d.Distances.Min); })
	  			.attr("r", 2);

    }

    renderAxisLabels() {

		const labels = this.container
							.append("g")
								.attr("class", "axis")
							.selectAll("g")
								.data(ticks).enter();
		labels
			.append("rect")
			.attr("width", 20)
			.attr("height", 10)
			.attr("x", -10)
			.attr("y", (d) => { return -5-this.scaleRadius(d); });
		
		labels
			.append("text")
			.text((d) => { return d; })
			.attr("y",  (d) => { return 3 - this.scaleRadius(d); });
    }

    show() {
    	const chart = this.container.select(".chart");

    	chart.selectAll("g")
    		.transition()
                .duration(animDuration)
                .delay(function(d, i) { return i * 50; })
            .style("opacity", 1);

         chart
         	.selectAll("text")
         		.transition()
                	.delay(function(d, i) { return (i + 2) * 50; })
                .style("opacity", 1);


        this.container
            .on("mouseover", (d) => this.showTooltip(d))
            .on("mouseout", (d) => this.hideTooltip(d))
            .on("mousemove", (d) => this.updateTooltip(d));
    }

    getTooltipLabel(d) {
        const item = d3.select(d3.event.target).data()[0];
        return (
            `<p>${item.FullName}</p>
	    	<p><small>Star Distances:</small></p>
	    	<p><small><strong>Min</strong> ${item.Distances.Min.toFixed(2)}</small></p>
	    	<p><small><strong>Max</strong> ${item.Distances.Max.toFixed(2)}</small></p>
	    	<p><small><strong>Avg</strong> ${item.Distances.Avg.toFixed(2)}</small></p>`
        );
    }

};

export default DistanceStats;