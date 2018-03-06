window.GC = window.GC || {};

(function (d3, exports) {
    function drawLegend(scales) {

        var legendContainer = d3.select(".legend");
        var size = legendContainer.node().getBoundingClientRect(),
            width = size.width,
            height = 125;

        var legend = legendContainer
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // temperature legend
        var temperatures = legend
            .append("g").attr("class", "temperatures")
            .selectAll("g")
            .data(scales.temperature.domain()).enter()
            .append("g")
            .attr("transform",
                function(d, i) {
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
            .style("fill", function(d) { return scales.temperatureColor(d); })
            .style("fill-opacity", 0.7);

        temperatures
            .append("text")
            .text(function(d) { return "temperature " + d + "\u2103"; });

        addSplitLine(legend, 140);

        // species legend
        var species = legend
            .append("g")
            .attr("class", "species")
            .attr("transform", "translate(180, 20)")
            .selectAll("g")
            .data(scales.species.domain()).enter()
            .append("g")
            .attr("transform",
                function(d, i) {
                    var x = Math.floor(i / 5) * 150;
                    var y = (i % 5) * 25;
                    return "translate(" + x + "," + y + ")";
                });

        species
            .append("circle")
            .attr("r", 7)
            .attr("cx", -10)
            .attr("cy", -5)
            .style("fill", function(d) { return scales.speciesColor(d); })

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
            .attr("cy", function(d) { return d.y; })
            .attr("r", 4)
            .style("fill", "yellow")
            .style("fill-opacity", 0.7)
            .style("stroke", "#555");

        intenses
            .append("line")
            .attr("x1", 0).attr("y1", function(d) { return d.y; })
            .attr("x2", 30).attr("y2", function(d) { return d.y; })
            .style("stroke", "#555")
            .style("stroke-dasharray", "3, 1");

        intenses
            .append("text")
            .text(function(d) { return d.value + " lux" })
            .attr("transform", function(d) { return "translate(35," + (d.y + 3) + ")"; });
    }

    function generateDemoDrop(top, bottom, radius) {
        return `M ${radius} ${top} 
            Q 0 ${top - 2 * radius} ${-radius} ${top}
            L 0 ${bottom} Z`;
    }

    function addSplitLine(container, x) {
        container
            .append("line")
            .attr("x1", x).attr("y1", 0)
            .attr("x2", x).attr("y2", "100%")
            .style("stroke", "#dadada");
    }

    exports.drawLegend = drawLegend;

})(d3, window.GC);