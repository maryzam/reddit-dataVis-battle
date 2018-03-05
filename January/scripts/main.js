var temperatureScaleRadius = 5;
var tempSeriesOffset = 0.01;

var container = d3.select(".container");
var size = container.node().getBoundingClientRect(),
    width = size.width,
    height = size.height || size.width * 0.4;

var svg = container.append("svg")
				.attr("width", width)
                .attr("height", height);

var defs = svg.append("defs");

var innerRadius = Math.min(width, height) * 0.4,
    outerRadius = Math.min(width, (height));

d3.json("data/algae-growth.json", function (error, data) {
	if (error) throw error;
	
    var summary = getAggregatedInfo(data);
    var scales = prerateAllScales(summary);

    drawLegend(scales);
    drawChart(data, scales);
});

function drawChart(data, scales) {

    data = prepareData(data, scales);

    var chart = svg
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height + ")");

    drawSupportLines(chart, data);
    drawTemperatureScale(chart, scales);
    drawGrowthMarkers(chart, data, scales);
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

        d._radius_5000 = scales.growth(d.light_5000);
        d._radius_2500 = scales.growth(d.light_2500);

        d._supportLine = {
            x1: d._cos * innerRadius,
            y1: d._sin * innerRadius,
            x2: d._cos * outerRadius,
            y2: d._sin * outerRadius
        };
    });

    return data;
}

function drawLegend(scales) {
    var legendContainer = d3.select(".legend");
    var legend = legendContainer
        .append("svg")
        .attr("width", width)
        .attr("height", 125);

    // temperature legend
    var temperatures = legend
        .append("g").attr("class", "temperatures")
        .selectAll("g")
        .data(scales.temperature.domain()).enter()
        .append("g")
        .attr("transform", function (d, i) {
            var rowOffset = 30 + i * 25;
            return "translate(25, " + rowOffset + ")";
        });

    var xSize = temperatureScaleRadius * 4;
    var ySize = temperatureScaleRadius * 2;
    var xOffset = -xSize - 5;
    var yOffset = -ySize + 2;
    temperatures
        .append("rect")
        .attr("rx", 3).attr("ry", 3)
        .attr("x", xOffset).attr("y", yOffset)
        .attr("width", xSize)
        .attr("height", ySize)
        .style("fill", function (d) { return scales.temperatureColor(d); })
        .style("fill-opacity", 0.7);

    temperatures
        .append("text")
        .text(function (d) { return "temperature " + d + "\u2103"; });

    addSplitLine(legend, 140);

    // species legend
    var species = legend
        .append("g")
            .attr("class", "species")
            .attr("transform", "translate(180, 20)")
        .selectAll("g")
            .data(scales.species.domain()).enter()
            .append("g")
                .attr("transform", function(d, i) {
                    var x = Math.floor(i / 5) * 150;
                    var y = (i % 5) * 25;
                    return "translate(" + x + "," + y + ")";
            });

    species
        .append("circle")
        .attr("r", 7)
        .attr("cx", -10)
        .attr("cy", -5)
        .style("fill", function (d) { return scales.speciesColor(d); })

    species
        .append("text")
        .text(function(d) { return d; });

    addSplitLine(legend, 770);

    // ligth intense explanation
    var lights = legend
        .append("g")
        .attr("class", "species")
        .attr("transform", "translate(790, 20)");

    lights
        .append("path")
        .attr("d", generateDemoDrop(10, 80, 10))
        .style("fill", "rgb(38, 173, 129)");

    var intenses = lights
        .selectAll("g")
        .data([{ y: 10, value: 5000 }, { y: 75, value: 2500 }])
        .enter()
        .append("g");

    intenses
        .append("circle")
        .attr("cy", function (d) { return d.y; })
        .attr("r", 4)
        .style("fill", "yellow")
        .style("fill-opacity", 0.7)
        .style("stroke", "#555");

    intenses
        .append("line")
        .attr("x1", 0).attr("y1", function (d) { return d.y; })
        .attr("x2", 30).attr("y2", function (d) { return d.y; })
        .style("stroke", "#555")
        .style("stroke-dasharray", "3, 1");

    intenses
        .append("text")
        .text(function (d) { return d.value + " lux" })
        .attr("transform", function (d) { return "translate(35," + (d.y + 3) + ")";});
}

function drawSupportLines(chart, data) {
    
    var gradient = defs
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

    chart.append("g").attr("name", "support-lines")
        .selectAll("line")
        .data(data).enter()
        .append("line")
            .attr("x1", function (d) { return d._supportLine.x1; })
            .attr("y1", function (d) { return d._supportLine.y1; })
            .attr("x2", function (d) { return d._supportLine.x2; })
            .attr("y2", function (d) { return d._supportLine.y2; })
            .style("stroke", "url(#grey-lines)");
}

function drawGrowthMarkers(chart, data, scales) {
    prepareShadows();

    var growthContainer = chart
                            .append("g").attr("class", "growth-markers")
                            .selectAll("g")
                            .data(data).enter()
                            .append("g");
    growthContainer
        .append("path")
        .filter(function (d) { return d.light_5000 !== d.light_2500; })
            .attr("d", generateDrop)
            .style("fill", function (d) { return scales.speciesColor(d.name); })
            .style("filter", "url(#drop-shadow)")
            .style("stroke", "white")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", 0.5);

    growthContainer
        .append("circle")
        .filter(function (d) { return d.light_5000 == d.light_2500; })
            .attr("cx", function (d) { return d._cos * d._radius_5000; })
            .attr("cy", function (d) { return d._sin * d._radius_5000; })
            .attr("r", 4)
            .style("fill", function (d) { return scales.speciesColor(d.name); })
            .style("filter", "url(#drop-shadow)")
            .style("stroke", "white")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", 0.5);
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

function generateDemoDrop(top, bottom, radius) {
    return `M ${radius} ${top} 
            Q 0 ${top - 2 * radius} ${-radius} ${top}
            L 0 ${bottom} Z`;
}

function prepareShadows() {
    var defs = svg.append("defs");

    var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%")
        .attr("width", "130%")

    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 1)
        .attr("result", "blur");

    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 3)
        .attr("dy", 3)
        .attr("result", "offsetBlur");

    filter.append("feFlood")
        .attr("flood-color", "#555")
        .attr("flood-opacity", 0.5)
        .attr("result", "offsetColor");

    filter.append("feComposite")
        .attr("in", "offsetColor")
        .attr("in2", "offsetBlur")
        .attr("operator", "in")
        .attr("result", "offsetBlur");

    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
}

function addSplitLine(container, x) {
    container
        .append("line")
        .attr("x1", x).attr("y1", 0)
        .attr("x2", x).attr("y2", "100%")
        .style("stroke", "#dadada");
}