
import * as d3 from "d3";

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

  	const dists = container
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
	  	.attr("transform", function(d) { return `translate(0,${scaleRadius(d.Distances.Avg) + 7 })`; });

}