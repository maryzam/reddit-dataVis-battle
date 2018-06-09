
d3.csv("./data/emperors.v2.csv")
	.then(function(source) {

		const container = d3.select(".container");

		const width = 800;
		const height = 800;
		const margin = 100;
		const svg = container.append("svg")
						.attr("width", width  + 2 * margin)
						.attr("height", height + 2 * margin)
						.append("g")
						.attr("transform", `translate(${margin},${margin})`);

		const rise = distinct(source, (d) => (d.rise));
		const cause = distinct(source, (d) => (d.cause));
		const dynasty = distinct(source, (d) => (d.dynasty));

		const scaleRise = d3.scalePoint()
							.domain(rise.map((d) => d.name))
							.range([0, width]);

		const scaleCause = d3.scalePoint()
							.domain(cause.map((d) => d.name))
							.range([0, height]);

		const scaleDynasty = d3.scaleSequential(d3.interpolateWarm)
							   .domain([0, dynasty.length]);

		// draw rise asix

		const rises = svg.append("g").attr("class", ".rise-axis")
						.selectAll(".rise")
							.data(rise).enter()
						.append("g")
							.attr("class", "rise")
							.attr("transform", (d) => `translate(${scaleRise(d.name)},0)`);

		rises
			.append("text")
			.text((d) => d.name)
			.attr("transform", `translate(0,${-margin / 2})rotate(-30)`);

		rises
			.append("line")
			.attr("y2", height)
			.style("stroke", "grey");

		// draw cause axis
		const causes = svg.append("g").attr("class", ".cause-axis")
						.selectAll(".cause")
							.data(cause).enter()
						.append("g")
							.attr("class", "cause")
							.attr("transform", (d) => `translate(0,${scaleCause(d.name)})`);

		causes
			.append("text")
			.text((d) => d.name)
			.attr("transform", `translate(${-margin / 2},0)rotate(-30)`);

		causes
			.append("line")
			.attr("x2", width)
			.style("stroke", "grey");

		// show emperors

		const maxAge = getMax(source, (d) => d["age.death"]);
		const scaleLife = d3.scaleLinear().domain([0, maxAge]).range([0, 25]);

		var simulation = d3.forceSimulation(source)
		      .force("x", d3.forceX(function(d) { return scaleRise(d.rise); }).strength(1))
		      .force("y", d3.forceY(function(d) { return scaleCause(d.cause); }).strength(1))
		      .force("collide", d3.forceCollide().radius((d) => (scaleLife(d["age.death"]) || 0) + 2).iterations(2))
		      .stop();

		for (var i = 0; i < 250; ++i) simulation.tick();

		const emperors = svg.selectAll(".emperor")
			.data(source.filter((d) => d["age.death"] > 0)).enter()
			.append("g")
				.attr("class", "emperor")
				.attr("transform", (d) => `translate(${d.x},${d.y})`);


		emperors
			.append("circle")
				.attr("r", (d) => scaleLife(d["age.death"]))
				.style("fill", "black")
				.style("stroke", function (d) {
					const dynastyId = dynasty.findIndex((x) => (x.name == d.dynasty));
					return scaleDynasty(dynastyId);
				})
				.style("stroke-width", 1);

		emperors
			.append("circle")
				.attr("r", (d) => scaleLife(d["age.reign.end"]))
				.style("fill", function (d) {
					const dynastyId = dynasty.findIndex((x) => (x.name == d.dynasty));
					return scaleDynasty(dynastyId);
				})

		emperors
			.append("circle")
				.attr("r", (d) => scaleLife(d["age.reign.start"]))
				.style("fill", "balck");

	});

function distinct(source, accessor, ordered = true) {
	const data = {};
	source.forEach((d) => {
		const key = accessor(d);
		data[key] = (data[key] || 0) + 1;
	});
	const result = Object.keys(data)
		.map((d) => ({ 
			name: d,
			weight: data[d]
		}));

	if (ordered) {
		result.sort((a,b) => (b.weight - a.weight));
	}

	return result;
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