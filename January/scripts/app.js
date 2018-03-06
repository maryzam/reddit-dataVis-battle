var temperatureScaleRadius = 5;
var tempSeriesOffset = 0.01;

var container = d3.select(".container");
var size = container.node().getBoundingClientRect(),
    width = size.width,
    height = size.height || size.width * 0.4;

var svg = container.append("svg")
				.attr("width", width)
                .attr("height", height);

var innerRadius = Math.min(width, height) * 0.4,
    outerRadius = Math.min(width, (height));

d3.json("data/algae-growth.json", function (error, data) {
	if (error) throw error;
	
    var summary = getAggregatedInfo(data);
    var scales = prerateAllScales(summary);

    GC.drawLegend(scales);
    GC.drawChart(svg, data, scales);
});

function getAggregatedInfo(data) {
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

    return {
        temperatures: temperatures,
        species: species,
        maxGrowth: maxGrowth,
        minGrowth: minGrowth
    };
}

function prerateAllScales(summary) {

    var scaleTemperature = d3.scaleBand()
        .range([-Math.PI / 2, Math.PI / 2])
        .domain(summary.temperatures)
        .padding(0.01)
        .align(0);

    var scaleSpecies = d3.scaleBand()
        .range([tempSeriesOffset, scaleTemperature.bandwidth() - tempSeriesOffset])
        .domain(summary.species)
        .padding(0.1)
        .align(0);

    var scaleGrowth = d3.scaleLinear()
        .range([innerRadius, outerRadius])
        .domain([summary.minGrowth, summary.maxGrowth]);

    var scaleSpeciesColor = getColorScale(summary.species, d3.interpolateViridis);

    var scaleTemperatureColor = getColorScale(summary.temperatures, d3.interpolateYlOrRd);

    return {
        temperature: scaleTemperature,
        temperatureColor: scaleTemperatureColor,
        species: scaleSpecies,
        speciesColor: scaleSpeciesColor,
        growth: scaleGrowth
    };
}

function getColorScale(domain, interpolator) {
    var helper = d3.scaleSequential(interpolator).domain([-1, domain.length + 1]);
    var colors = [];
    for (var i = 0; i < domain.length; i++) {
        colors.push(helper(i));
    }
    return d3.scaleOrdinal().domain(domain).range(colors);
}