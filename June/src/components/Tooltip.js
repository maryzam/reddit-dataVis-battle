
	const yearReg = /^-?\d+/;

	function isUnknown(data) {
		return data === "Unknown" || data === "NA";
	}

	class Tooltip {

		constructor(container, scaleDynasty) {
			this.scaleDynasty = scaleDynasty;
			this.container = container;
		}

		show(data) {
			const text = this.format(data);
			this.container
					.style("display", "block")
					.html(text);
		}

		hide() {
			this.container.style("display", "none");
		}

		move(pos) {
			
			const size = this.container.node().getBoundingClientRect();
			const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    		const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

			let top = pos.pageY + 5;
			if ((top + size.height) > windowHeight) {
				top = top - size.height - 10;
			}

			let left = pos.pageX + 5; 
			if ((left + size.width) > windowWidth) {
				left = left - size.width - 10;
			}
			
			this.container
				.style("top", `${ top }px`)
			    .style("left", `${ left }px`);
		}

		format(data) {
			return `
				<p class="title centered" 
					style="background: ${ this.scaleDynasty(data.dynasty)}">
						${ data.name }
				</p>
				<p><small>#${ data.num } Roman Emperor (${ data.dynasty } Dynasty)</small></p>
				<p>(${ isUnknown(data.birthYear) ? "?" : data.birthYear } - ${ data.deathYear })</p>
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
	};

	export default Tooltip;