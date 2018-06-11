
	import * as d3 from "d3";
	
	const daysPerYear = 365;

	const sampleYears = [ 10, 40, 70 ];

	const samplePeriods = [
			{ age: 80, description: "after Reign period (if presented)" },
			{ age: 60, description: "Reign period", isReign: true },
			{ age: 25, description: "before Rise to power" }
	];

	const labelPointSize = 1.5;
	const labelLineSize = 50;
	const markRadius = 5;
	const titleOffset = 30;

	class Legend {

		constructor(selector, scales) {

			const ph = d3.select(selector);
			const size = ph.node().getBoundingClientRect();

			this.size = {
				width: size.width,
				height: size.height
			};

			this.container = ph.append("svg")
								.attr("width", this.size.width)
								.attr("height", this.size.height);
			
			this.scales = scales;
		}

		render(data) {

			this.drawDynastiesInfo(data, { x: 450, y: 0 });
			this.drawDurationInfo({ x: 300, y: 0 });
			this.drawPeriodsInfo({ x: 50, y: 0 });
		}

		drawDynastiesInfo(dynasties, position) {

			const margin = markRadius * 2;
			const totalWidth = markRadius * 3 * dynasties.length;

			const scaleOrder = d3.scalePoint()
									.domain(dynasties)
									.range([0, totalWidth]);

			const legend = this.container
								.append("g")
									.attr("class", "dynasties")
									.attr("transform", `translate(${margin + position.x}, ${ this.size.height / 2 + margin })`);

			const nodes = legend
							.selectAll("g")
								.data(dynasties).enter()
							.append("g")
								.attr("transform", (d) => `translate(${ scaleOrder(d) }, 0)rotate(-90)`);
			nodes
				.append("circle")
					.attr("r", markRadius)
					.style("fill", this.scales.dynasty);

			nodes
				.append("text")
					.text((d) => d)
					.attr("dx", 10)
					.attr("dy", 5);

			const title = legend
							.append("g")
							.attr("transform", "translate(0, 20)")
			title
				.append("line")
				.attr("class", "timeline")
				.attr("x1", -margin)
				.attr("x2", totalWidth + margin);

			title
				.append("path")
				.attr("class", "timeline")
				.attr("d", "M0,-3L6,0L0,3")
				.attr("transform", `translate(${totalWidth + margin},0)`);

			title
				.append("text")
				.attr("class", "title")
				.attr("dx", -margin)
				.attr("dy", 15)
				.text("Dynasties (ordered by Reign time)");
		}

		drawDurationInfo(position) {

			const maxYear = d3.max(sampleYears, (d) => d);
			const midPoint = this.size.height / 2 + this.scales.life(maxYear * daysPerYear);

			const legend = this.container
							.append("g")
								.attr("class", "years")
								.attr("transform", `translate(${ position.x }, ${ position.y })`);

			legend.append("line")
					.attr("class", "axis")
					.attr("y2", this.size.height);

			legend.append("text")
				.text("Radius refers to period's duration")
				.attr("dx", -titleOffset)
				.attr("dy", titleOffset);

			const nodes = legend
							.append("g")
								.attr("class", "years")
							.selectAll(".year")
								.data(sampleYears).enter()
							.append("g")
								.attr("class", "year")
								.attr("transform", (d) => `translate(0, ${midPoint - 2 * this.scales.life(d * daysPerYear)})`);

			nodes
				.append("circle")
					.attr("r", (d) => this.scales.life(d * daysPerYear))
					.attr("transform", (d) => `translate(0, ${ this.scales.life(d * daysPerYear)})`);

			nodes
				.append("line")
					.attr("x2", labelLineSize);
			nodes
				.append("circle")
					.attr("class", "mark")
					.attr("r", labelPointSize);

			nodes
				.append("text")
					.text((d) => `${d} years`)
					.attr("dy", 3)
					.attr("transform", `translate(${ labelLineSize + 5 }, 0)`);
		}

		drawPeriodsInfo(position) {

			const halfHeight = this.size.height / 2;
			const legend = this.container
							.append("g")
								.attr("class", "periods")
								.attr("transform", `translate(${position.x}, ${ position.y + halfHeight })`);

			legend.append("line")
					.attr("class", "axis")
					.attr("y1", -halfHeight)
					.attr("y2", halfHeight);

			legend.append("text")
				.text("Each circle represents a life period")
				.attr("dx", -titleOffset)
				.attr("dy", -halfHeight + titleOffset);

			const nodes = legend
							.selectAll(".period")
								.data(samplePeriods).enter()
							.append("g")
								.attr("class", "period");

			nodes.append("circle")
					.attr("r", (d) => this.scales.life(d.age * daysPerYear))
					.attr("class", (d) => (d.isReign ? "filled" : ""));

			const labels = nodes
							.append("g")
							.attr("transform", (d, i) => 
								`translate(0,${ (this.scales.life(d.age * daysPerYear) - 4) * (d.isReign ? -1 : 1) })`
							);

			labels.append("line").attr("x2", labelLineSize);

			labels
				.append("circle")
				.attr("class", "mark")
				.attr("r", labelPointSize);

			labels
				.append("text")
				.attr("dx", (labelLineSize + 5))
				.attr("dy", 3)
				.text((d) => d.description);
		}
	}

export default Legend;