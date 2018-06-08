
d3.csv("./data/emperors.v2.csv")
	.then(function(source) {

		const container = d3.select(".container");

		const width = 900;
		const height = 600;
		const svg = container.append("svg")
						.attr("width", width)
						.attr("height", height);


		const rise = distinct(source, (d) => (d.rise));
		const cause = distinct(source, (d) => (d.cause));
		const dynasty = distinct(source, (d) => (d.dynasty));

		const scaleRise = d3.scalePoint().domain(rise).range([width*0.1, width*0.9]);
		const scaleCause = d3.scalePoint().domain(cause).range([height*0.1, height*0.9]);
		const scaleDynasty = d3.scaleSequential(d3.interpolateWarm).domain([0, dynasty.length]);
		const maxAge = getMax(source, (d) => d["age.death"]);
		const scaleLife = d3.scaleLinear().domain([0, maxAge]).range([0, 15]);

		var simulation = d3.forceSimulation(source)
		      .force("x", d3.forceX(function(d) { return scaleRise(d.rise); }).strength(1))
		      .force("y", d3.forceY(function(d) { return scaleCause(d.cause); }).strength(1))
		      .force("collide", d3.forceCollide().radius((d) => (scaleLife(d["age.death"]) || 0) + 2).iterations(2))
		      .stop();

		for (var i = 0; i < 250; ++i) simulation.tick();

		const emperors = svg.selectAll(".emperor")
			.data(source).enter()
			.append("g")
				.attr("class", "emperor")
				.attr("transform", (d) => `translate(${d.x},${d.y})`);


		emperors
			.append("circle")
				.attr("r", (d) => (scaleLife(d["age.death"]) || 0) + 1)
				.style("fill", "black")
				.style("stroke", function (d) {
					const dynastyId = dynasty.indexOf(d.dynasty);
					return scaleDynasty(dynastyId);
				})
				.style("stroke-width", 1);

		emperors
			.append("circle")
				.attr("r", (d) => (scaleLife(d["age.reign.end"]) || 0))
				.style("fill", function (d) {
					const dynastyId = dynasty.indexOf(d.dynasty);
					return scaleDynasty(dynastyId);
				})

		emperors
			.append("circle")
				.attr("r", (d) => (scaleLife(d["age.reign.start"]) || 0))
				.style("fill", "balck");

	});


function distinct(source, accessor) {
	const data = {};
	source.forEach((d) => {
		const key = accessor(d);
		data[key] = key;
	});
	return Object.keys(data);
}

function getMax(source, accessor) {
	let max = -Infinity;
	for (let i = 0; i < source.length; i++) {
		const value = +accessor(source[i]);
		if (!!value & value > max) {
			max = value;
		}
	}
	return max;
}