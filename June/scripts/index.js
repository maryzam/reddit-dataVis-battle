
d3.csv("./data/emperors.v2.csv")
	.then(function(source) {

		const container = d3.select(".container");
		const size = container.node().getBoundingClientRect();
		const ratio = causeTypes.length / riseTypes.length;

		const outerWidth = size.width - 20;
		const outerHeight = Math.floor(outerWidth * ratio);
		const margin = 50;
		const svg = container.append("svg")
						.attr("width", outerWidth)
						.attr("height", outerHeight)
						.append("g")
						.attr("transform", `translate(${margin},${margin})`);

		const width = outerWidth - 2 * margin;
		const height = outerHeight - 2 * margin;

		const dynasty = distinct(source, (d) => (d.dynasty));

		const scaleRise = d3.scaleLinear()
							.domain([0, d3.max(riseTypes, (d) => d.position)])
							.range([0, width]);

		const scaleCause = d3.scaleLinear()
							.domain([0, d3.max(causeTypes, (d) => d.position)])
							.range([0, height]);

		const scaleDynasty = d3.scaleSequential(d3.interpolateWarm)
							   .domain([0, dynasty.length]);

		// draw rise asix

		const rises = svg.append("g").attr("class", ".rise-axis")
						.selectAll(".rise")
							.data(riseTypes).enter()
						.append("g")
							.attr("class", "rise")
							.attr("transform", (d) => `translate(${scaleRise(d.position)},0)`);
		rises
			.append("line")
			.attr("class", "axis")
			.attr("y1", margin / 2)
			.attr("y2", height + margin / 2);

		rises
			.append("text")
			.attr("transform", "rotate(-30)")
			.selectAll("tspan")
				.data(splitLabel).enter()
			.append("tspan")
				.text((d) => d)
				.attr("x", 0)
				.attr("y", 0)
				.attr("dy", (d, i) => `${(i * 1)}em`);


		// draw cause axis
		const causes = svg.append("g").attr("class", ".cause-axis")
						.selectAll(".cause")
							.data(causeTypes).enter()
						.append("g")
							.attr("class", "cause")
							.attr("transform", (d) => `translate(0,${scaleCause(d.position)})`);

		causes
			.append("line")
			.attr("class", "axis")
			.attr("x1", margin /2 )
			.attr("x2", width + margin / 2 );

		causes
			.append("text")
			.attr("transform", "rotate(-30)")
			.selectAll("tspan")
				.data(splitLabel).enter()
			.append("tspan")
				.text((d) => d)
				.attr("x", 0)
				.attr("y", 0)
				.attr("dy", (d, i) => `${(i * 1)}em`);

		// show emperors

		const maxAge = getMax(source, (d) => d["age.death"]);
		const scaleLife = d3.scaleLinear().domain([0, maxAge]).range([0, 25]);

		const maxReign = getMax(source.filter((d) => isNaN(d["age.death"])), (d) => d["death.till"]);
		const scaleReign = d3.scaleLinear().domain([0, maxReign]).range([2, 10]);

		var simulation = d3.forceSimulation(source)
		      .force("x", d3.forceX(function(d) { 
		      		const info = riseTypes.find((x) => (x.name === d.rise))
		      		return scaleRise(info.position); 
		      	}).strength(1))
		      .force("y", d3.forceY(function(d) {
		      		const info = causeTypes.find((x) => (x.name === d.cause))
		      		return scaleCause(info.position); 
		      	}).strength(1))
		      .force("collide", d3.forceCollide()
		      						.radius((d) => {
		      							const radius = isNaN(d["age.death"]) ?
		      									scaleReign(d["death.till"]) :
		      									scaleLife(d["age.death"]);
		      							return (radius + 2);
		      						})
		      						.iterations(2))
		      .stop();

		for (var i = 0; i < 250; ++i) simulation.tick();

		const emperors = svg.selectAll(".emperor")
			.data(source).enter()
			.append("g")
				.attr("class", "emperor")
				.attr("transform", (d) => `translate(${d.x},${d.y})`);

		const fullInfoEmperors = emperors.filter((d) => !isNaN(d["age.death"]));
		
		fullInfoEmperors
			.append("circle")
				.attr("r", (d) => scaleLife(d["age.death"]))
				.style("fill", "black")
				.style("stroke", function (d) {
					const dynastyId = dynasty.indexOf(d.dynasty);
					return scaleDynasty(dynastyId);
				})
				.style("stroke-width", 1);

		fullInfoEmperors
			.append("circle")
				.attr("r", (d) => scaleLife(d["age.reign.end"]))
				.style("fill", function (d) {
					const dynastyId = dynasty.indexOf(d.dynasty);
					return scaleDynasty(dynastyId);
				})

		fullInfoEmperors
			.append("circle")
				.attr("r", (d) => scaleLife(d["age.reign.start"]))
				.style("fill", "black");

		const missingEmperors = emperors.filter((d) => isNaN(d["age.death"]));

		const hexbin = d3.hexbin();

		missingEmperors
			.append("path")
			.attr("d", function(d) {
				const radius = scaleReign(d["death.till"]);
				return hexbin.hexagon(radius);
			})
			.style("fill", "black")
			.style("stroke", function (d) {
					const dynastyId = dynasty.indexOf(d.dynasty);
					return scaleDynasty(dynastyId);
			});

		missingEmperors
			.append("path")
			.attr("d", function(d) {
				const radius = scaleReign(d["reign.duration"]);
				return hexbin.hexagon(radius);
			})
			.style("fill", function (d) {
					const dynastyId = dynasty.indexOf(d.dynasty);
					return scaleDynasty(dynastyId);
			});
	});

function distinct(source, accessor) {
	const data = {};
	source.forEach((d) => {
		const key = accessor(d);
		data[key] = (data[key] || 0) + 1;
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
};

function splitLabel(label) {
	return label.name.split(/ (.+)/);
}