var EI = EI || {};

(function(d3, exports) {

	const margin = 50;
	
	const hexbin = d3.hexbin();

	function splitLabel(label) {
		return label.name.split(/ (.+)/);
	}

	const chart = function(selector, data, scales) {

		this.data = data;
		
		this.size = null;
		this.container = null;
		this.scales = null;

		this.init(selector);

		this.setupScales(scales);
		this.runSimulation();

		this.drawRiseAxis();
		this.drawCauseAxis();
		this.drawEmperors();

		this.setupTooltip();
	};

	chart.prototype.getRisePos = function(d) { 
		const info = riseTypes.find((x) => (x.name === d.rise))
		return this.scales.rise(info.position); 
	};

	chart.prototype.getCausePos = function(d) {
		const info = causeTypes.find((x) => (x.name === d.cause))
		return this.scales.cause(info.position); 
	};

	chart.prototype.getRadius = function(d) {
		const radius = isNaN(d["age.death"]) ?
		   		this.scales.reign(d["death.till"]) :
		   		this.scales.life(d["age.death"]);
		return (radius + 2);
	};

	chart.prototype.init = function(selector) {

		const ph = d3.select(selector);
		const size = ph.node().getBoundingClientRect();
		const ratio = causeTypes.length / riseTypes.length;

		const outerWidth = size.width - 20; // offset in case of page scroll
		const outerHeight = Math.floor(outerWidth * ratio);

		this.container = ph
					.append("svg")
						.attr("width", outerWidth)
						.attr("height", outerHeight)
					.append("g")
						.attr("transform", `translate(${margin},${margin})`);

		this.size = {
			width:  outerWidth - 2 * margin,
			height: outerHeight - 2 * margin
		};
	};

	chart.prototype.setupScales = function(scales) {

		const rise = d3.scaleLinear()
							.domain([0, d3.max(riseTypes, (d) => d.position)])
							.range([0, this.size.width]);

		const cause = d3.scaleLinear()
							.domain([0, d3.max(causeTypes, (d) => d.position)])
							.range([0, this.size.height]);

		this.scales = Object.assign({ rise, cause }, scales);
	};

	chart.prototype.runSimulation = function() {

		const simulation = d3.forceSimulation(this.data)
		      .force("x", d3.forceX((d) => this.getRisePos(d)).strength(1))
		      .force("y", d3.forceY((d) => this.getCausePos(d)).strength(1))
		      .force("collide", d3.forceCollide().radius((d) => this.getRadius(d)).iterations(2))
		      .stop();

		for (let i = 0; i < 250; ++i) { simulation.tick(); }
	};

	chart.prototype.drawRiseAxis = function() {

		const rises = this.container
						.append("g")
							.attr("class", ".rise-axis")
						.selectAll(".rise")
							.data(riseTypes).enter()
						.append("g")
							.attr("class", "rise")
							.attr("transform", (d) => `translate(${ this.scales.rise(d.position) },0)`);
		rises
			.append("line")
				.attr("class", "axis")
				.attr("y1", margin / 2)
				.attr("y2", this.size.height + margin / 2);

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
	};

	chart.prototype.drawCauseAxis = function() {

		const causes = this.container
						.append("g")
							.attr("class", ".cause-axis")
						.selectAll(".cause")
							.data(causeTypes).enter()
						.append("g")
							.attr("class", "cause")
							.attr("transform", (d) => `translate(0,${ this.scales.cause(d.position)})`);
		causes
			.append("line")
			.attr("class", "axis")
			.attr("x1", margin /2 )
			.attr("x2", this.size.width + margin / 2 );

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
	};

	chart.prototype.drawEmperors = function() {

		const nodes = this.container
						.selectAll(".emperor")
							.data(this.data).enter()
						.append("g")
							.attr("class", "emperor")
							.attr("transform", (d) => `translate(${d.x},${d.y})`);

		const emperors = nodes.filter((d) => !isNaN(d["age.death"]));
		
		emperors
			.append("circle")
				.attr("class", "handler")
				.attr("r", (d) => this.scales.life(d["age.death"]))
				.style("fill", "black")
				.style("stroke", (d) => this.scales.dynasty(d.dynasty))
				.style("stroke-width", 1);

		emperors
			.append("circle")
				.attr("r", (d) => this.scales.life(d["age.reign.end"]))
				.style("fill", (d) => this.scales.dynasty(d.dynasty))

		emperors
			.append("circle")
				.attr("r", (d) => this.scales.life(d["age.reign.start"]))
				.style("fill", "black");

		const missingEmperors = nodes.filter((d) => isNaN(d["age.death"]));

		missingEmperors
			.append("path")
			.attr("class", "handler")
			.attr("d", (d) => this.getHexagon(d["death.till"]))
			.style("fill", "black")
			.style("stroke", (d) => this.scales.dynasty(d.dynasty));

		missingEmperors
			.append("path")
			.attr("d", (d) => this.getHexagon(d["reign.duration"]))
			.style("fill", (d) => this.scales.dynasty(d.dynasty));

	};

	chart.prototype.setupTooltip = function() {

		const tooltip = new exports.Tooltip(this.scales.dynasty);

		this.container
			.selectAll(".handler")
				.on("mouseover", (d) => tooltip.show(d))
				.on("mouseout", (d) => tooltip.hide())
				.on("mousemove", (d) => tooltip.move(d3.event));
	}

	chart.prototype.getHexagon = function(duration) {
		const radius = this.scales.reign(duration);
		return hexbin.hexagon(radius);
	}

	exports.Chart = chart;

}) (d3, EI);