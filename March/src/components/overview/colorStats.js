
import * as d3 from "d3";

export function renderColors(selector, data) { 

	const ph = d3.select(selector);
    const size = ph.node().getBoundingClientRect();
    const width = size.width - 40;
    const height = size.height - 40;

    const scaleX = d3.scaleBand()
    				.domain(data.map(function(d) { return d.Name; }))
    				.range([0, width])
    				.padding(0.1);

    const scaleY = d3.scaleLinear()
    			.domain([
    				d3.min(data, function(d) { return d.Colors.Min; }),
    				d3.max(data, function(d) { return d.Colors.Max; })
    			])
    			.range([height, 0]);

    const colors = d3.scaleLinear()
            .domain([-0.4, 0.5, 1.5, 3.0, 5.0])
            .range(["#7AF7FF", "#ffffff",  "#FFD230", "#FF8400", "#FF3E00"])
            .clamp(true);


    const tooltip = d3.select(".tooltip");
  	const container = ph.append("svg")
	    		.attr("width", size.width)
	    		.attr("height", size.height)
	    	.append("g")
	    		.attr("transform", "translate(0, 20)")
	    		.attr("class", "star-colors");

	 const gradient = ph
	 	.select("svg")
	 	.append("defs")
	 	.append("linearGradient")
	 		.attr("id", "color-gradient")
	 		.attr("gradientUnits", "userSpaceOnUse")
	 		.attr("x1", 0).attr("y1", "100%")
      		.attr("x2", 0).attr("y2", 0);

	 const stops = colors.domain().map(function(d) {
	 	return {
	 		offset: (100 * (1- scaleY(d) / height)).toFixed(0) + "%",
	 		color: colors(d)
	 	};
	 });

	 gradient
	 	.selectAll("stop")
	 		.data(stops).enter()
	 	.append("stop")
      		.attr("offset", function(d) { return d.offset; })
      		.attr("stop-color", function(d) { return d.color; });

	 const items = container
	 	.selectAll("g")
	 	.data(data).enter()
	 	.append("g")
	 	.attr("transform", function(d) {
	 		return `translate(${scaleX(d.Name)}, 0)`;
	 	});

	 items
	 	.append("rect")
		 	.attr("y", function(d){ return scaleY(d.Colors.Max); })
		 	.attr("height", function(d) { return scaleY(d.Colors.Min) - scaleY(d.Colors.Max); })
		 	.attr("width", scaleX.bandwidth())
		 	.style("fill", "url(#color-gradient)")
		 	.attr("rx", 2)
		 	.attr("ry", 2);

	// draw avg line
	const midLine = d3.line()
				    .x(function(d) { return scaleX(d.Name) + scaleX.bandwidth() * 0.5; })
				    .y(function(d) { return scaleY(d.Colors.Avg); })
				    .curve(d3.curveMonotoneX);
	container
		.append("path")
    		.datum(data) 
    		.attr("class", "line")
    		.attr("d", midLine);
}