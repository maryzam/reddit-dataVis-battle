
d3.csv("./data/emperors.v2.csv")
	.then(function(source) {

		// shared scales 
		const dynasty = distinct(source, (d) => (d.dynasty));
		const maxAge = getMax(source, (d) => d["age.death"]);
		const maxReign = getMax(source.filter((d) => isNaN(d["age.death"])), (d) => d["death.till"]);

		const scaleColor = d3.scaleSequential(d3.interpolateWarm).domain([0, dynasty.length]);

		const scales = {
			dynasty: (d) => { 
				const dynastyId = dynasty.indexOf(d);
				return scaleColor(dynastyId);
			},
			life: d3.scaleLinear().domain([0, maxAge]).range([0, 25]),
			reign: d3.scaleLinear().domain([0, maxReign]).range([2, 10])
		}

		// render legend & main dataViz
		const legend = new EI.Legend(".legend", dynasty, scales);
		const chart = new EI.Chart(".container", source, scales);
		
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