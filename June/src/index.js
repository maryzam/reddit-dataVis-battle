import * as d3 from "d3";

import { emperors } from "./data/emperors";

import { distinct, getMax } from "./utils";

import Legend from "./components/Legend";
import Chart from "./components/Chart";

// shared scales 
const dynasty = distinct(emperors, (d) => (d.dynasty));
const maxAge = getMax(emperors, (d) => d.ageDeath);
const maxReign = getMax(emperors.filter((d) => isNaN(d.ageDeath)), (d) => d.deathTill);

const scaleColor = d3
					.scaleSequential(d3.interpolateWarm)
					.domain([0, dynasty.length]);

const scales = {
	dynasty: (d) => { 
		const dynastyId = dynasty.indexOf(d);
		return scaleColor(dynastyId);
	},
	life: d3.scaleLinear().domain([0, maxAge]).range([0, 25]),
	reign: d3.scaleLinear().domain([0, maxReign]).range([2, 10])
}

// init & render legend & main dataViz
const legend = new Legend(".legend", scales);
const chart = new Chart(".container", scales);

legend.render(dynasty);
chart.render(emperors);

		
