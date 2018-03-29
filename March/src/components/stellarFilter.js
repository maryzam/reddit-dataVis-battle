import * as d3 from "d3";

const onSelect = function() {
	console.log(this.value);
}

class StellarFilter {

	constructor(selector, data) {

		const select = d3.select(selector)
							.append("select")
    						.on('change', onSelect);
    	select
    		.selectAll('option')
			.data(data).enter()
				.append('option')
					.attr("value", function(d) { return d.Abbreviation; })
					.text(function (d) { return d.Name; });
	}
}

export default StellarFilter;