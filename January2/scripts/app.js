
d3.json("data/algae-growth.json", function (error, data) {
	if (error) throw error;

    data = prepareData(data);
    var summary = getAggregated(data);

    var growthOffset = 0.01;
    var minGrowth = d3.min(data, function(d) { return d.growth; }) - growthOffset;
    var maxGrowth = d3.max(data, function(d) { return d.growth; }) + growthOffset;
    var growthScale = d3.scaleLinear()
        .domain([minGrowth, maxGrowth])
        .range([0, 900]);

    var maxCount = d3.max(data, function (d) { return d.order; })
    var speciesScale = d3.scaleBand()
        .domain(d3.range(maxCount + 1))
        .range([100, 0])
        .padding(0.05);

    var svg = d3.select(".container")
        .append("svg")
        .attr("width", 950)
        .attr("height", 400);

    var speciesColorScale = d3
        .scaleSequential(d3.interpolateCool)
        .domain([0, summary.species.length]);

    var container = svg.append("g")
        .attr("transform", "translate(25,25)");

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

    var axis = d3.axisBottom(growthScale).ticks(20);
    container
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, 105)")
        .call(axis);
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
