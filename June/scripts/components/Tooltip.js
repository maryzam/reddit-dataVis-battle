var EI = EI || {};

(function(d3, exports) {

	const yearReg = /^-?\d+/;

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
			<p>(${ data.birthYear } - ${ data.deathYear })</p>
			${ isUnknown(data.birthPrv) ? '' :
				`<p>
					<span>From:</span> ${ data.birthPrv } 
					${ isUnknown(data.birthCity) ? '' : `(${ data.birthCity })`}	
				</p>` }
			<p><span>Reign:</span> ${ data.reignStart } - ${ data.reignEnd }</p>
			<p><span>Rise to Power:</span> ${ data.rise }</p>
			<p><span>Death:</span> ${ data.cause } (${ data.killer })</p>
		`;	
	}

	tooltip.prototype.show = function(data) {
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