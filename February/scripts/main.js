
d3.csv("data/ssm.csv", function(error, source) {
	if (error) throw error;
	
	var data = prepareData(source);
	var svg = createContainer();

	appendGooeyFilter(svg);
	generateChart(svg, data);
});

function createContainer() {
	var width = cellSize. width * statesGrid.columns;
	var height = cellSize. height * statesGrid.rows;
	var svg = d3.select(".container")
			.append("svg")
				.attr("width", width)
				.attr("height", height);
	return svg;
};

function prepareData(source) {
	return source.map(function (item) {
		var aggregated = {
			state: item.State,
			abbrev: item.abbrev,
			dynamics: []
		};
		var noLawDuration = 0,
			statutoryBanDuratinon = 0,
			constitutionalBanDuratinon = 0,
			legalDuration = 0;
		for (var key in item) {
			var status = item[key];
			switch(status) {
				case "No Law":
					noLawDuration++;
					break;
				case "Statutory Ban":
					statutoryBanDuratinon++;
					break;
				case "Constitutional Ban":
					constitutionalBanDuratinon++;
					break;
				case "Legal":
					legalDuration++;
					break;
			}
		}
		aggregated.dynamics = [
			{ status: "No Law", duration: noLawDuration },
			{ status: "Statutory Ban", duration: statutoryBanDuratinon },
			{ status: "Constitutional Ban", duration: constitutionalBanDuratinon },
			{ status: "Legal", duration: legalDuration }
		];
		return aggregated;
	});
};

function generateChart(svg, data) {
	var states = svg
			.append("g")
			
		.selectAll("g")
			.data(data).enter()
			.append("g")
				.attr("class", "state")
				.attr("transform", (d, i) => { 
					var x = (i % statesGrid.columns) * cellSize.width;
					var y = Math.floor(i / statesGrid.columns) * cellSize.height;
					return "translate(" +  x + "," + y + ")"; 
				});

	var titleOffset = cellSize.width / 2;
	states
		.append("text")
		.attr("transform", "translate(" +  titleOffset + ",15)")
		.style("text-anchor", "middle")
		.text(d => d.state);
	
	var charts = states
		.append("g")
		.style("filter", "url(#gooeyFilter)");
		
	charts
		.selectAll("circle")
			.data((d) => prepareSingleChart(d.dynamics)).enter()
				.append("circle")
					.attr("r", (d) => d.radius )
					.attr("cx", (d) => d.offset )
					.style("fill", (d) => d.color)
					.style("fill-opacity", "0.7");
					
	charts
		.attr("transform", function() {
			var realSize = d3.select(this).node().getBoundingClientRect();
			var xOffset = (cellSize.width - realSize.width) / 2 ;
			var yOffset = maxRadius + 15;
			return "translate(" + xOffset + "," + yOffset +")"
		}); 
	
};

function prepareSingleChart(data) {
	var result = [];
	var offset = 0;
	for (var i = 0; i < data.length; i++) {
		var item = data[i];
		if (item.duration == 0) {
			continue;
		}
		var radius = scaleRadius(item.duration);
		offset = offset + radius;
		result.push({
			radius: radius,
			offset: offset,
			color: scaleColor(item.status)
		});
		offset = offset + radius;
	}
	return result;
}

function appendGooeyFilter(svg) {
	var filter = svg.append("defs").append("filter").attr("id","gooeyFilter");
	filter.append("feGaussianBlur")
			.attr("in","SourceGraphic")
			.attr("stdDeviation", 5)
			.attr("color-interpolation-filters","sRGB") 
			.attr("result","blur");
	filter.append("feColorMatrix")
			.attr("in","blur")
			.attr("mode","matrix")
			.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9")
			.attr("result","gooey");
}