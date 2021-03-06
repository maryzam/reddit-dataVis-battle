import * as d3 from "d3";
import { hexbin } from "d3-hexbin";

import { riseTypes } from "../data/riseTypes";
import { causeTypes } from "../data/causeTypes";

import Tooltip from "./Tooltip";

const margin = 50;
const hb = hexbin();

function splitLabel(label) {
	return label.name.split(/ (.+)/);
}

class Chart {

	constructor(selector, scales) {

		this.initContainer(selector);
		this.setupScales(scales);
	}

	initContainer(selector) {

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
	}

	setupScales(scales) {

		const rise = d3.scaleLinear()
							.domain([0, d3.max(riseTypes, (d) => d.position)])
							.range([0, this.size.width]);

		const cause = d3.scaleLinear()
							.domain([0, d3.max(causeTypes, (d) => d.position)])
							.range([0, this.size.height]);

		this.scales = Object.assign({ rise, cause }, scales);
	}

	render(data) {

		this.runSimulation(data);

		this.drawRiseAxis();
		this.drawCauseAxis();
		this.drawEmperors(data);

		this.setupTooltip();
	}

	runSimulation(data) {

		const simulation = d3.forceSimulation(data)
		      .force("x", d3.forceX(this.getRisePos).strength(1))
		      .force("y", d3.forceY(this.getCausePos).strength(1))
		      .force("collide", d3.forceCollide().radius(this.getRadius).iterations(2))
		      .stop();

		for (let i = 0; i < 250; ++i) { simulation.tick(); }
	}

	drawRiseAxis() {
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
	}

	drawCauseAxis() {
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
	}

	drawEmperors(data) {

		const nodes = this.container
						.selectAll(".emperor")
							.data(data).enter()
						.append("g")
							.attr("class", "emperor")
							.attr("transform", (d) => `translate(${d.x},${d.y})`);

		const emperors = nodes.filter((d) => !isNaN(d.ageDeath));
		
		emperors
			.append("circle")
				.attr("class", "handler")
				.attr("r", (d) => this.scales.life(d.ageDeath))
				.style("fill", "black")
				.style("stroke", (d) => this.scales.dynasty(d.dynasty))
				.style("stroke-width", 1);

		emperors
			.append("circle")
				.attr("r", (d) => this.scales.life(d.ageReignEnd))
				.style("fill", (d) => this.scales.dynasty(d.dynasty))

		emperors
			.append("circle")
				.attr("r", (d) => this.scales.life(d.ageReignStart))
				.style("fill", "black");

		const missingEmperors = nodes.filter((d) => isNaN(d.ageDeath));

		missingEmperors
			.append("path")
			.attr("class", "handler")
			.attr("d", (d) => this.getHexagon(d.deathTill))
			.style("fill", "black")
			.style("stroke", (d) => this.scales.dynasty(d.dynasty));

		missingEmperors
			.append("path")
			.attr("d", (d) => this.getHexagon(d.reignDuration))
			.style("fill", (d) => this.scales.dynasty(d.dynasty));
	}

	setupTooltip() {

		const tooltip = new Tooltip(
				d3.select("#tooltip"),
				this.scales.dynasty
			);

		this.container
			.selectAll(".handler")
				.on("mouseover", (d) => tooltip.show(d))
				.on("mouseout", (d) => tooltip.hide())
				.on("mousemove", (d) => tooltip.move(d3.event));
	}

	getHexagon(duration) {
		const radius = this.scales.reign(duration);
		return hb.hexagon(radius);
	}

	getRisePos = (d) => { 
		const info = riseTypes.find((x) => (x.name === d.rise));
		return this.scales.rise(info.position); 
	};

	getCausePos = (d) => { 
		const info = causeTypes.find((x) => (x.name === d.cause));
		return this.scales.cause(info.position); 
	};

	getRadius = (d) => {
		const radius = isNaN(d.ageDeath) ?
		   		this.scales.reign(d.deathTill) :
		   		this.scales.life(d.ageDeath);
		return (radius + 2);
	};

}

export default Chart;
