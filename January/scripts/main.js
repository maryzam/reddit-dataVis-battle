var temperatureScaleRadius = 5;
var tempSeriesOffset = 0.01;
var ligthOffset = 12;

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

    showLegend(scales);
    drawChart(data, scales);
});

function showLegend(scales) {
    var legendContainer = d3.select(".legend");
    var legend = legendContainer
                        .append("svg")
                            .attr("width", width)
                            .attr("heigth", 100);
    var temperatures = legend
                            .append("g")
                            .selectAll("g")
                            .data(scales.temperature.domain()).enter()
                            .append("g")
                                .attr("transform", function(d, i) {
                                    var rowOffset = 15 + i * 30;
                                    return "translate(30, " + rowOffset + ")";
                                });
    temperatures
        .append("circle")
        .attr("r", 7)
        .attr("cx", -15)
        .attr("cy", -4)
        .style("fill", function(d) { return scales.temperatureColor(d); })
        .style("fill-opacity", 0.7);

    temperatures
        .append("text")
        .text(function (d) { return "temperature " + d + "\u2103"; })
}

function drawChart(data, scales) {

    data = prepareData(data, scales);

    var chart = svg
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height + ")");

    var growthContainers = chart
        .append("g")
        .attr("name", "growth")
        .selectAll("g")
        .data(data).enter()
        .append("g");

    drawSupportLines(growthContainers);
    drawGrowthMarkers(growthContainers, scales);
    drawTemperatureScale(chart, scales);
}

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

function prepareData(data, scales) {
    
    var angleOffset = scales.species.bandwidth() / 2;

    data.forEach(function (d) {
        var angle = scales.temperature(d.temperature) + scales.species(d.name) + angleOffset;
        // rotate the angle
        d._cos = Math.sin(angle);
        d._sin = -Math.cos(angle);
        d._angle = angle * 180 / Math.PI;

        d._radius_5000 = scales.growth(d.light_5000) + ligthOffset * (d.light_5000 > 0 ? 1 : -1);
        d._radius_2500 = scales.growth(d.light_2500) + ligthOffset * (d.light_2500 > 0 ? 1 : -1);

        var supportInnerRadius = innerRadius - ligthOffset * 3;
        var supportOuterRadius = outerRadius + ligthOffset * 2;
        d._supportLine = {
            x1: d._cos * supportInnerRadius,
            y1: d._sin * supportInnerRadius,
            x2: d._cos * supportOuterRadius,
            y2: d._sin * supportOuterRadius
        };
    });

    return data;
}

function drawSupportLines(growthContainer) {

    var gradient = svg
        .append("defs")
        .append("radialGradient")
        .attr("id", "grey-lines");

    gradient
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#dadada" },
            { offset: "50%", color: "#ddd" },
            { offset: "100%", color: "white" }
        ]).enter()
        .append("stop")
            .attr("offset", function (d) { return d.offset; })
            .attr("stop-color", function (d) { return d.color; })

    growthContainer
        .append("line")
            .attr("x1", function (d) { return d._supportLine.x1; })
            .attr("y1", function (d) { return d._supportLine.y1; })
            .attr("x2", function (d) { return d._supportLine.x2; })
            .attr("y2", function (d) { return d._supportLine.y2; })
            .style("stroke", "url(#grey-lines)");
}

function drawGrowthMarkers(growthContainer, scales) {

    growthContainer
        .append("path")
        .filter(function (d) { return d.light_5000 !== d.light_2500; })
            .attr("d", generateDrop)
            .style("fill", function (d) { return scales.speciesColor(d.name); })
            .style("fill-opacity", 1);

    growthContainer
        .append("circle")
        .filter(function (d) { return d.light_5000 == d.light_2500; })
            .attr("cx", function (d) { return d._cos * d._radius_5000; })
            .attr("cy", function (d) { return d._sin * d._radius_5000; })
            .attr("r", 4)
            .style("fill", function (d) { return scales.speciesColor(d.name); })
            .style("fill-opacity", 1);
}

function drawTemperatureScale(container, scales) {

    var temperatureInnerRadius = scales.growth(0) - temperatureScaleRadius;
    var temperatureOuterRadius = temperatureInnerRadius + (2 * temperatureScaleRadius);
    var temperatures = scales.temperature.domain();

    container
        .append("g")
            .attr("name", "temperatures")
        .selectAll("path")
        .data(temperatures).enter()
            .append("path")
                .attr("d", d3.arc()
                    .innerRadius(temperatureInnerRadius)
                    .outerRadius(temperatureOuterRadius)
                    .cornerRadius(3)
                    .startAngle(function (d) { return scales.temperature(d); })
                    .endAngle(function (d) { return scales.temperature(d) + scales.temperature.bandwidth(); }))
                .style("fill", function (d) { return scales.temperatureColor(d); })
                .style("fill-opacity", 0.8)
                .style("stroke", "white")
                .style("stroke-width", "1");
}

function getColorScale(domain, interpolator) {
    var helper = d3.scaleSequential(interpolator).domain([-1, domain.length + 1]);
    var colors = [];
    for (var i = 0; i < domain.length; i++) {
        colors.push(helper(i));
    }
    return d3.scaleOrdinal().domain(domain).range(colors);
}

function generateDrop(d) {
    var x2500 = d._cos * d._radius_2500;
    var y2500 = d._sin * d._radius_2500;
    var x5000 = d._cos * d._radius_5000;
    var y5000 = d._sin * d._radius_5000;
    var xOffset = -d._sin * 4;
    var yOffset = d._cos * 4;
    var coeff = d._radius_2500 > d._radius_5000 ? -2 : 2;
    return `M ${x5000 + xOffset} ${y5000 + yOffset} 
            Q ${x5000 + coeff * yOffset} ${y5000 - coeff * xOffset} ${x5000 - xOffset} ${y5000 - yOffset} 
            L ${x2500 - (coeff / 2) * yOffset} ${y2500 + (coeff / 2) * xOffset} Z`;
}