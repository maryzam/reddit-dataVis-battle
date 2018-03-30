
import * as d3 from "d3";

const ticks = [2, 5, 10, 20, 50, 150, 350, 800];

export function renderDistances(selector, data) { 

	const ph = d3.select(selector);
    const size = ph.node().getBoundingClientRect();

  	const outerRadius = Math.min(size.width, size.height) * 0.5 - 10;
  	const scaleRadius = d3.scaleLog()
  						  .domain([1, 1000])
  						  .range([0, outerRadius]);

  	const scaleName = d3.scaleBand()
  						.domain(data.map((d) => d.Name))
  						.range([-180, 180])
  						.padding(0.01);

	const tooltip = d3.select(".tooltip");
  	const container = ph.append("svg")
	    	.attr("width", size.width)
	    	.attr("height", size.height)
  		.append("g").attr("class", "stars-distance")
  			.attr("transform", `translate(${size.width/2},${size.height/2})`);

  	renderAxis(container, scaleRadius);

  	const dists = container
  		.append("g")
  			.attr("class", "chart")
  		.selectAll("g")
  			.data(data).enter()
  		.append("g")
  			.attr("transform", function(d) { 
  				const angle = scaleName(d.Name);
  				return `rotate(${angle})`;
  			});

	dists
  		.append("line")
  			.attr("y1", function(d) { return scaleRadius(d.Distances.Min); })
  			.attr("y2", function(d) { return scaleRadius(d.Distances.Max); });
  	dists
  		.append("text")
  		.text("★")
	  	.attr("transform", function(d) { return `translate(0,${scaleRadius(d.Distances.Avg) + 7 })`; })
	  	.on("mouseover", function() { tooltip.style("display", "block"); })
	    .on("mouseout", function() { tooltip.style("display", "none"); })
	    .on("mousemove", function(d) {
	    	const { pageX, pageY } = d3.event;
	    	tooltip
	    		.style("top", `${pageY + 5}px`)
	    		.style("left", `${pageX + 5}px`)
	    		.html(
	    			`<p>${d.FullName}</p>
	    			<p><small>Star Distances:</small></p>
	    			<p><small><strong>Min</strong> ${d.Distances.Min.toFixed(2)}</small></p>
	    			<p><small><strong>Max</strong>  ${d.Distances.Max.toFixed(2)}</small></p>
	    			<p><small><strong>Avg</strong>  ${d.Distances.Avg.toFixed(2)}</small></p>`
	    		);
	    });

	dists
  		.append("circle")
  			.attr("cy", function(d) { return scaleRadius(d.Distances.Max); })
  			.attr("r", 2)
  			.style("fill", "white")
  			.style("stroke", "none");

	dists
  		.append("circle")
  			.attr("cy", function(d) { return scaleRadius(d.Distances.Min); })
  			.attr("r", 2)
  			.style("fill", "white")
  			.style("stroke", "none");

  	renderAxisLabels(container, scaleRadius);
}

function renderAxis(container, scaleRadius) {
	const axis = container
		.append("g").attr("class", "axis");

	axis.selectAll("circle")
			.data(ticks).enter()
		.append("circle")
			.attr("r", function(d) { return scaleRadius(d); });
}

function renderAxisLabels(container, scaleRadius) {
	const axis = container
		.append("g").attr("class", "axis");

	const labels = axis.selectAll("g").data(ticks).enter();

	labels
		.append("rect")
		.attr("width", 20)
		.attr("height", 10)
		.attr("x", -10)
		.attr("y", function(d) { return -5-scaleRadius(d); });
	
	labels
		.append("text")
		.text(function(d) { return d; })
		.attr("y",  function(d) { return 3 - scaleRadius(d); });
}