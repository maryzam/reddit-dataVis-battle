window.GC = window.GC || {};

(function (d3, exports) {

    var tooltip = d3.select(".tooltip"); //todo refactoring

    function drawChart(svg, source, scales) {

        var chart = svg
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height + ")");
        var defs = svg.append("defs");
        var data = prepareData(source, scales);

        drawSupportLines(chart, data, defs);
        drawTemperatureScale(chart, scales);
        drawGrowthMarkers(chart, data, scales, defs);
        hideTooltip();

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

            d._color = scales.speciesColor(d.name)
        });
        return data;
    }

    function drawSupportLines(chart, data, defs) {

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

    function drawGrowthMarkers(chart, data, scales, defs) {
        prepareShadows(defs);

        var growthContainer = chart
            .append("g").attr("class", "growth-markers")
            .selectAll("g")
            .data(data).enter()
            .append("g")
            .on("mouseover", function(d) {
                var target = d3.select(d3.event.target);
                target
                    .transition()
                    .duration(100)
                    .style("stroke", "tomato" )
                    .style("stroke-width", 2);

                showTooltip(d);
            })
            .on("mouseout", function(d) {
                var target = d3.select(d3.event.target);
                target
                    .transition()
                    .duration(100)
                    .style("stroke", "white")
                    .style("stroke-width", 0.5);

                hideTooltip();
            });

        growthContainer
            .append("path")
            .filter(function (d) { return d.light_5000 !== d.light_2500; })
            .attr("d", generateDrop)
            .style("fill", function (d) { return d._color; })
            .style("filter", "url(#drop-shadow)")
            .style("stroke", "white")
            .style("stroke-opacity", 0.7)
            .style("stroke-width", 0.5);

        growthContainer
            .append("circle")
            .filter(function (d) { return d.light_5000 == d.light_2500; })
            .attr("cx", function (d) { return d._cos * d._radius_5000; })
            .attr("cy", function (d) { return d._sin * d._radius_5000; })
            .attr("r", 4)
            .style("fill", function (d) { return d._color; })
            .style("filter", "url(#drop-shadow)")
            .style("stroke", "white")
            .style("stroke-opacity", 0.7)
            .style("stroke-width", 0.5);
    }

    function showTooltip(d) {
        var label = "<h6>" + d.name +
            "</h6><p class=\"small\">(temperature: " + d.temperature + "\u2103)</p>" +
            "<p>Growth rates </p>" +
            "<p class=\"small\"><strong>5000 lux </strong> " + d.light_5000 + "<small> (divisions per day)</small></p>" + 
            "<p class=\"small\"><strong>2500 lux </strong> " + d.light_2500 + "<small> (divisions per day)</small></p>";
        tooltip.html(label);
    }

    function hideTooltip() {
        tooltip
            .html("Hover a marker <br/>to get <br/>full information");
            
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

    function prepareShadows(defs) {

        var filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "200%")
            .attr("width", "200%")

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

    exports.drawChart = drawChart;

})(d3, window.GC)