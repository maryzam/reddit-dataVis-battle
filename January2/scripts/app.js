var width = 950;
var height = 400;
var offset = 50;
var barChartPadding = 0.5;

d3.json("data/algae-growth.json", function (error, data) {
	if (error) throw error;

    data = prepareData(data);
    var summary = getAggregated(data);

    var growthOffset = 0.01;
    var minGrowth = d3.min(data, function(d) { return d.growth; }) - growthOffset;
    var maxGrowth = d3.max(data, function(d) { return d.growth; }) + growthOffset;

    var chartWidth = width - offset;
    var chartHeight = (height - offset)
    var growthScale = d3.scaleLinear()
        .domain([minGrowth, maxGrowth])
        .range([0, chartWidth]);

    var maxCount = d3.max(data, function (d) { return d.order; })
    var speciesHeight = height / 4;
    var speciesScale = d3.scaleBand()
        .domain(d3.range(maxCount + 1))
        .range([speciesHeight, 0])
        .padding(barChartPadding);

    var svg = d3.select(".container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var speciesColorScale = d3
        .scaleSequential(d3.interpolateCool)
        .domain([0, summary.species.length]);

    var scaleWidth = chartWidth / 3;

    var temperatureScale = d3.scaleBand()
        .domain(summary.temperatures)
        .range([0, scaleWidth])
        .padding(0.05);

    var lightScale = d3.scaleBand()
        .domain(summary.lights)
        .range([2 * scaleWidth, chartWidth])
        .padding(0.05);

    var margin = offset / 2;
    var container = svg.append("g")
        .attr("transform", "translate(" + margin + "," + margin+")");

    // links
    var linkContainer = container
        .append("g")
        .attr("class", "links-scale");

    var tOffset = temperatureScale.bandwidth() / 2;
    var lOffset = lightScale.bandwidth() / 2;
    var bottom = chartHeight - 2;
    var top = speciesHeight + 8;
    linkContainer
        .selectAll("path")
        .data(data).enter()
        .append("path")
        .attr("d", function (d) {
            var xt = temperatureScale(d.temperature) + tOffset;
            var xl = lightScale(d.light) + lOffset;
            var xg = growthScale(d.growth);
            return `M ${xt} ${bottom} L ${xg} ${top} L ${xl} ${bottom}`
        })
        .style("fill", "none")
        .style("stroke", function (d) {
            var idx = summary.species.indexOf(d.name);
            return speciesColorScale(idx);
        })
        .style("stroke-opacity", 0.5);

    // bar chart of growth
    var pointWidth = 4;
    container.append("g")
        .selectAll("circle")
        .data(data).enter()
        .append("rect")
            .attr("x", function(d) { return growthScale(d.growth); })
            .attr("y", function(d) { return speciesScale(d.order); })
            .attr("data-ord", function(d) { return (d.order); })
            .attr("width", pointWidth)
            .attr("height", speciesScale.bandwidth())
            .style("fill", function(d) {
                var idx = summary.species.indexOf(d.name);
                return speciesColorScale(idx);
            })
            .attr("rx", 2).attr("ry", 2);

    // growth axis 


    var axis = d3.axisTop(growthScale).ticks(20).tickPadding(-3);
    container
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (speciesHeight + 5) + ")")
        .call(axis);

    // temperature scale
    var temperatureContainer = container
        .append("g")
        .attr("class", "temperature-scale")
        .attr("transform", "translate(0," + chartHeight + ")");

    temperatureContainer
        .selectAll("rect")
        .data(summary.temperatures).enter()
        .append("rect")
            .attr("x", function(d) {
                return temperatureScale(d);
            }).attr("y", 0)
            .attr("width", temperatureScale.bandwidth())
            .attr("height", 10)
            .attr("rx", 3).attr("ry", 3)
            .style("fill", "tomato")
            .style("fill-opacity", 0.7);

    // light scale
    var lightContainer = container
        .append("g")
        .attr("class", "light-scale")
        .attr("transform", "translate(0," + chartHeight + ")");

    lightContainer
        .selectAll("rect")
        .data(summary.lights).enter()
        .append("rect")
        .attr("x", function (d) { return lightScale(d); })
        .attr("y", 0)
        .attr("width", lightScale.bandwidth())
        .attr("height", 10)
        .attr("rx", 3).attr("ry", 3)
        .style("fill", "tomato")
        .style("fill-opacity", 0.7);

    
});

function prepareData(data) {
    var growth = {}
    data.forEach(function (d) {
        var key = "v_" + d.growth;
        growth[key] = growth[key] || 0
        d.order = growth[key];
        growth[key]++;
    });
    return data;
}

function getAggregated(data) {
    var species = [];
    var temperatures = [];
    var lights = [];

    data.forEach(function (d) {
        if (species.indexOf(d.name) < 0) {
            species.push(d.name);
        }
        if (temperatures.indexOf(d.temperature) < 0) {
            temperatures.push(d.temperature);
        }
        if (lights.indexOf(d.light) < 0) {
            lights.push(d.light);
        }
    });

    species.sort(function (a, b) { return a > b; });
    temperatures.sort(function (a, b) { return a < b; })
    lights.sort(function (a, b) { return a < b; })

    return {
        species: species,
        temperatures: temperatures,
        lights: lights
    }
}

