import * as d3 from "d3";

class VisWithTooltip {

	constructor(selector, source) {
		this.tooltip = d3.select(".tooltip");
	}

	getTooltipLabel(d) {
		return "";
	}

	showTooltip(d) {
		const label = this.getTooltipLabel(d);
		this.tooltip
			.style("display", "block")
			.html(label);
	}

	hideTooltip() {
		this.tooltip.style("display", "none");
	}

	updateTooltip() {
		const { pageX, pageY } = d3.event;
		this.tooltip
			.style("top", `${pageY + 5}px`)
		    .style("left", `${pageX - 85}px`);
	}
}

export default VisWithTooltip;
