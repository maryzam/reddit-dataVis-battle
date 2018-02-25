
appendStatusLegend();
appendDurationLegend();

function appendStatusLegend() {
	var svg = d3.select(".legend-statuses")
				.append("svg")
					.attr("width", 200)
					.attr("height", 80);
					
	var statusesLegend = svg.append("g").attr("class", "statuses");
						
	var statuses = statusesLegend.selectAll("g")
					.data(legalStatuses).enter()
					.append("g")
						.attr("transform", function(d, i) { return "translate(0," + (20 * i)+ ")"});
	statuses
		.append("circle")
			.attr("cx", 10)
			.attr("cy", 10)
			.attr("r", 7)
			.style("fill", function(d) { return scaleColor(d) });
	
	statuses
		.append("text")
			.attr("transform", "translate(25,14)")
			.text(function(d) { return d;});
}

function appendDurationLegend() {

	var svg = d3.select(".legend-duration")
				.append("svg")
					.attr("width", 300)
					.attr("height", 80);
	
	var yearsLegend = svg
						.append("g")
							.attr("class", "duration")
							.attr("transform", "translate(30, 35)");
	
	var years = yearsLegend
					.selectAll("g")
					.data([1, 5, 10, 15]).enter()
					.append("g")
					
					.attr("transform", function(d, i) { return "translate(" + (i * 70) + ", 0)"});
	
	years
		.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
				.attr("r", function(d) { return scaleRadius(d) - 5; })
				.style("fill", "#dadada");

	years
		.append("text")
			.attr("transform","translate(0, 40)")
			.text(function(d) { return d + (d > 1 ? " years" : " year"); })
			.style("text-anchor", "middle")
}