
import * as d3 from "d3";

export function renderStarsNumber(selector, data, dict) {

    data.forEach(function(d) {
          var info = dict.find(function(item) { return item.Abbreviation === d.Name; });
          d["FullName"] = info.Name;
          d["Family"] = info.Family;
    });

    const families = new Set(dict.map((d) => d.Family));
    families
    	.forEach(function(d) {
    		if (d && d.length) {
    			data.push({ Name: d, Family: "All Stars" });
    		}
	    });
    data.push({ Name: "All Stars" });

	const ph = d3.select(selector);
    const size = ph.node().getBoundingClientRect();
		
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

	const container = ph.append("svg")
    	.attr("width", size.width)
    	.attr("height", size.height)
  		.append("g").attr("class", "stars-total");

  	const color = d3.scaleSequential(d3.interpolateMagma).domain([-4, 4]);

  	const nodes = container
    				.selectAll("g")
    				.data(root.descendants()).enter()
    				.append("g")
      					.attr("transform", function(d) { return `translate(${d.x},${d.y})`; });

	nodes.append("circle")
	      .attr("id", function(d) { return "node-" + d.id; })
	      .attr("r", function(d) { return d.r; })
	      .style("fill", function(d) { return color(d.depth); });

  	nodes
  		.filter(function(d) { return !d.children; })
  		.append("text")
      	.attr("dy", function(d) { return d.r / 3; })
      	.text(function(d) { return d.data.Name; })
      	.style("font-size", function(d){ return `${(d.r - 1)}px`; });

    const arc = d3.arc()
					.innerRadius(function(d) { return (d.r - 5); })
					.outerRadius(function(d) { return (d.r + 10); })
					.startAngle(Math.PI * 0.15)
          			.endAngle(Math.PI * 0.77);

    const groups = nodes.filter(function(d) { return !!d.children; });

	groups
		.append("path")
	  		.attr("class", "group-arc")
			.attr("id", function(d,i) { return `arc${i}`; })
			.attr("d", arc);
	groups
		.append("text")
			.attr("class", "group-label")
			.attr("x", 5) 
			.attr("dy", 7) 
		.append("textPath")
			.attr("xlink:href", function(d,i){ return `#arc${i}`;})
			.text(function(d) { return d.data.Name ;});	
};
