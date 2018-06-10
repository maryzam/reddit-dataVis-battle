function renderViz(selector, data, scales) {

		const container = d3.select(selector);
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


		const scaleRise = d3.scaleLinear()
							.domain([0, d3.max(riseTypes, (d) => d.position)])
							.range([0, width]);

		const scaleCause = d3.scaleLinear()
							.domain([0, d3.max(causeTypes, (d) => d.position)])
							.range([0, height]);

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
		const simulation = d3.forceSimulation(data)
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
		      									scales.reign(d["death.till"]) :
		      									scales.life(d["age.death"]);
		      							return (radius + 2);
		      						})
		      						.iterations(2))
		      .stop();

		for (var i = 0; i < 250; ++i) simulation.tick();

		const emperors = svg.selectAll(".emperor")
			.data(data).enter()
			.append("g")
				.attr("class", "emperor")
				.attr("transform", (d) => `translate(${d.x},${d.y})`);

		const fullInfoEmperors = emperors.filter((d) => !isNaN(d["age.death"]));
		
		fullInfoEmperors
			.append("circle")
				.attr("r", (d) => scales.life(d["age.death"]))
				.style("fill", "black")
				.style("stroke", (d) => scales.dynasty(d.dynasty))
				.style("stroke-width", 1);

		fullInfoEmperors
			.append("circle")
				.attr("r", (d) => scales.life(d["age.reign.end"]))
				.style("fill", (d) => scales.dynasty(d.dynasty))

		fullInfoEmperors
			.append("circle")
				.attr("r", (d) => scales.life(d["age.reign.start"]))
				.style("fill", "black");

		const missingEmperors = emperors.filter((d) => isNaN(d["age.death"]));

		const hexbin = d3.hexbin();

		missingEmperors
			.append("path")
			.attr("d", function(d) {
				const radius = scales.reign(d["death.till"]);
				return hexbin.hexagon(radius);
			})
			.style("fill", "black")
			.style("stroke", (d) => scales.dynasty(d.dynasty));

		missingEmperors
			.append("path")
			.attr("d", function(d) {
				const radius = scales.reign(d["reign.duration"]);
				return hexbin.hexagon(radius);
			})
			.style("fill", (d) => scales.dynasty(d.dynasty));
}
