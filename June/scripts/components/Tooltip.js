var EI = EI || {};

(function(d3, exports) {

	const yearReg = /^-?\d+/;

	function formatYear(date) {
		const year = parseInt(yearReg.exec(date));
		if (isNaN(year)) {
			return "?";
		}
		return year < 0 ? `${ -year } BC` : `${ year } AD`;
	}

	function formatDate(date) {
		
	}

	function isUnknown(data) {
		return data === "Unknown" || data === "NA";
	}

	const tooltip = function(scaleDynasty) {

		this.scaleDynasty = scaleDynasty;
		this.container = d3.select("#tooltip");
	};

	tooltip.prototype.format = function(data) {
		return `
			<p class="title centered" 
				style="background: ${ this.scaleDynasty(data.dynasty)}">
					${ data.name }
			</p>
			<p><small>#${ data.num } Roman Emperor (${ data.dynasty } Dynasty)</small></p>
			<p>(${ formatYear(data.birth) } - ${ formatYear(data.death) })</p>
			${ isUnknown(data["birth.prv"]) ? '' :
				`<p>
					<span>From:</span> ${ data["birth.prv"] } 
					${ isUnknown(data["birth.cty"]) ? '' : `(${ data["birth.cty"] })`}	
				</p>` }
			<p><span>Reign:</span> ${ data["reign.start"] } - ${ data["reign.end"] }</p>
			<p><span>Rise to Power:</span> ${ data.rise }</p>
			<p><span>Death:</span> ${ data.cause } (${ data.killer })</p>
		`;	
	}

	tooltip.prototype.show = function(data) {
		console.log(data);
		const text = this.format(data);
		this.container
				.style("display", "block")
				.html(text);
	};

	tooltip.prototype.hide = function() {

		this.container.style("display", "none");
	};

	tooltip.prototype.move = function(pos) {
		this.container
			.style("top", `${pos.pageY + 5}px`)
		    .style("left", `${pos.pageX - 85}px`);
	};

	exports.Tooltip = tooltip;

}) (d3, EI);