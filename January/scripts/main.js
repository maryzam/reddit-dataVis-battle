var container = d3.select(".container");
var size = container.node().getBoundingClientRect(),
    width = size.width,
    height = size.height || size.width * 0.4;

var svg = container.append("svg")
				.attr("width", width)
				.attr("height", height);

var innerRadius = 180,
    outerRadius = Math.min(width, height) * 0.8;

var chart = svg
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height + ")");

d3.json("data/algae-growth.json", function (error, data) {
	if (error) throw error;
	
	var temperatures = [];
	var species = [];
	var maxGrowth = -Infinity,
        minGrowth = Infinity;

	data.forEach(function (d) {
	    if (temperatures.indexOf(d.temperature) < 0) { temperatures.push(d.temperature); }
	    if (species.indexOf(d.name) < 0) { species.push(d.name); }
	    if (maxGrowth < d.light_5000) { maxGrowth = d.light_5000; }
	    if (maxGrowth < d.light_2500) { maxGrowth = d.light_2500; }
	    if (minGrowth > d.light_5000) { minGrowth = d.light_5000; }
	    if (minGrowth > d.light_2500) { minGrowth = d.light_2500; }
	});

	var scaleTemperature = d3.scaleBand()
            .range([-Math.PI/2, Math.PI/2])
            .domain(temperatures)
            .padding(0.01)
            .align(0);

	var scaleSpecies = d3.scaleBand()
                 .range([0, scaleTemperature.bandwidth()])
                 .domain(species)
                 .padding(0.1)
                 .align(0);

	var scaleSpeciesColor = getColorScale(species, d3.interpolateViridis);
	var scaleTemperatureColor = getColorScale(temperatures, d3.interpolateYlOrRd);

	var scaleGrowth = d3.scaleLinear()
                 .range([innerRadius, outerRadius])
                 .domain([minGrowth, maxGrowth]);
    
	var tempRadiusOffset = 15;
	var tempInnerRadius = scaleGrowth(0);
	var tempOuterRadius = tempInnerRadius + tempRadiusOffset;

	chart
        .append("g")
            .attr("name", "temperatures")
        .selectAll("path")
            .data(temperatures).enter()
            .append("path")
            .attr("d", d3.arc()
                        .innerRadius(tempInnerRadius)
                        .outerRadius(tempOuterRadius)
                        .startAngle(function (d) { return scaleTemperature(d); })
                        .endAngle(function (d) { return scaleTemperature(d) + scaleTemperature.bandwidth(); }))
            .style("fill", function (d) { return scaleTemperatureColor(d); });

	chart
        .append("g")
            .attr("name", "growth")
        .selectAll("path")
            .data(data).enter()
            .append("path")
            .attr("d", d3.arc()
                        .innerRadius(tempOuterRadius + 5)
                        .outerRadius(tempOuterRadius + 15)
                        .startAngle(function (d) {
                            d.startAngle = scaleTemperature(d.temperature) + scaleSpecies(d.name);
                            return d.startAngle;
                        })
                        .endAngle(function (d) { return d.startAngle + scaleSpecies.bandwidth(); }))
            .style("fill", function (d) { return scaleSpeciesColor(d.name); });

});

function getColorScale(domain, interpolator) {
    var helper = d3.scaleSequential(interpolator).domain([-1, domain.length + 1]);
    var colors = [];
    for (var i = 0; i < domain.length; i++) {
        colors.push(helper(i));
    }
    return d3.scaleOrdinal().domain(domain).range(colors);
}