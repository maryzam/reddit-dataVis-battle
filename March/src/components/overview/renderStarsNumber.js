
import * as d3 from "d3";

export function renderStarsNumber(selector, source) {

	const ph = d3.select(selector);
	const tooltip = d3.select(".tooltip");
    const size = ph.node().getBoundingClientRect();
  	const color = d3.scaleSequential(d3.interpolateMagma).domain([-4, 4]);

	const data = getPackedData(source, size);

	const container = ph.append("svg")
    	.attr("width", size.width)
    	.attr("height", size.height)
  		.append("g").attr("class", "stars-total");

  	const nodes = container
    				.selectAll("g")
    				.data(data).enter()
    				.append("g")
      					.attr("transform", function(d) { return `translate(${d.x},${d.y})`; });

	nodes
		.append("circle")
	      .attr("id", function(d) { return "node-" + d.id; })
	      .style("fill", function(d) { return color(d.depth); })
	      .attr("r", function(d) { return d.r; });

  	const costellations = nodes
  		.filter(function(d) { return !d.children; });

  	costellations
  		.append("text")
	      	.attr("dy", function(d) { return d.r / 3; })
	      	.text(function(d) { return d.data.Name; })
	      	.style("font-size", function(d){ return `${(d.r - 1)}px`; });

	costellations
		.selectAll("circle")
		.on("mouseover", function() { tooltip.style("display", "block"); })
	    .on("mouseout", function() { tooltip.style("display", "none"); })
	    .on("mousemove", function(d) {
	    	const { pageX, pageY } = d3.event;
	    	tooltip
	    		.style("top", `${pageY + 5}px`)
	    		.style("left", `${pageX - 85}px`)
	    		.html(
	    			`<p>${d.data.FullName}</p>
	    			<p><strong>${d.data.StarCount}</strong> stars</p>`
	    		);
	    });


    const labelArc = d3.arc()
					.innerRadius(function(d) { return (d.r - 5); })
					.outerRadius(function(d) { return (d.r + 10); })
					.startAngle(Math.PI * 0.15);

    const groups = nodes.filter(function(d) { return !!d.children; });

	groups
		.append("path")
	  		.attr("class", "group-arc")
			.attr("id", function(d,i) { return `arc${i}`; })
			.attr("d", labelArc.endAngle(Math.PI * 0.77));

	groups
		.append("text")
			.attr("class", "group-label")
			.attr("x", 5) 
			.attr("dy", 7) 
		.append("textPath")
			.attr("xlink:href", function(d,i){ return `#arc${i}`;})
			.text(function(d) { return d.data.Name ;});	
};

function prepareData(source) 
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

function getPackedData(source, size) {
    const data = prepareData(source);
	const stratify = d3.stratify()
    					.parentId(function(d) { return d.Family; })
    					.id(function(d) { return d.Name; });

	const pack = d3.pack()
	    .size([size.width - 2, size.height - 2])
	    .padding(3);

	const root = stratify(data)
    	.sum(function(d) { return d.StarCount; })
      	.sort(function(a, b) { return b.StarCount - a.StarCount; });

    pack(root);

    return root.descendants();
}