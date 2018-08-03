    const radToDeg = 180 / Math.PI;

	Promise.all([
		d3.json("data/feeders.json"),
		d3.json("data/birds.json"),
	]).then((source) => {

			const feeders = source[0];
			const birds = source[1];

	   		const size = Math.floor((window.innerWidth / 3) - 20);

	   		// add container
	   		const svg = d3.select('main')
	   						.append('svg')
	   						.attr("width", size * 3)
	   						.attr("height", size * Math.ceil(feeders.length / 3));

	   		// prepare scales
	   		const maxRadius = size / 2 - 30;
	   		const minRadius =  Math.max(maxRadius * 0.1, 40);
	   		const scaleRadius = d3.scaleLinear().range([minRadius, maxRadius]);

	   		const scaleAngle = d3.scaleBand()
	   								.range([0, Math.PI * 2]);

    		// prepare radial area generator
    		const area = d3.areaRadial()
	    					.angle((d) => scaleAngle(d.data.seed))
	    					.innerRadius((d) => scaleRadius(d[0])) 
	    					.outerRadius((d) => scaleRadius(d[1])) 
	    					.curve(d3.curveCardinalClosed.tension(0));

    		const scaleBirds = (d) => {
    			const info = birds.find((x) => x.bird == d);
    			console.log(info);
    			if (info && info.color) {
    				return info.color;
    			}
    			return "#000";
    		}

	   		feeders.forEach((f, i) => {

	   			const feederBirds = getBirds(f, birds);
    			const feederSeeds = getSeeds(f);

    			const stack = d3.stack()
    						.keys(feederBirds)
	   						.order(d3.stackOrderNone)
    						.offset(d3.stackOffsetNone);

    			const data = stack(f.seeds);
    			// prepare scales
    			const max = d3.max(data, (d) => d3.max(d, (x) => x[1]));
    			scaleRadius.domain([ 0, max ]);
    			scaleAngle.domain(feederSeeds)

				// prepare container
				const offset = size /2
				const x = (i % 3) * size + offset;
				const y = Math.floor( i / 3) * size + offset;
     			const container = svg.append("g")
    								.attr("dataFeeder", f.feeder)
    								.attr("transform", `translate(${x}, ${y})`);
    			// add title
    			container
			    	.append("text")
			    		.attr("class", "title")
			    	.selectAll("tspan")
			    		.data(f.feeder.split(" ")).enter()
			    	.append("tspan")
			    		.text((d) => d)
			    		.attr("x", 0)
			    		.attr("y", (d, i) => i * 14);

    			// draw chart
    			container
    				.append('g')
    					.attr('class', 'chart')
    				.selectAll('.seed')
    					.data(data).enter()
    				.append('path')
    					.attr('class', 'seed')
    					.attr("d", (d) => area(d))
      					.style("fill", (d) => scaleBirds(d.key))
      					.style("stroke", "none");

      			// add axis
      			const sl = container 
      				.append('g')
      					.attr('class', 'axis')
      				.selectAll('.seed')
      					.data(feederSeeds).enter()
      				.append('g')
      					.attr('transform', (d) => `rotate(${ scaleAngle(d) * radToDeg - 90})`);

      			sl.append('line')
      					.attr('x1', minRadius - 3)
      					.attr('x2', maxRadius)
      					.style('stroke', '#000');

      			sl.append("circle")
      				.attr("r", 1.5)
      				.attr("cx", minRadius - 3)
      				.style("fill", "#000")


      			sl.append('text')
      				.text((d) => d)
      				.attr("transform", (d, i) => `translate(${ maxRadius}, 0)rotate(${i && i < 5 ? 0: 180 })`)
      				.attr("dy", -3)
      				.style("text-anchor", (d, i) => (i && i < 5) ? "end": "start")
	   		});

	   		// add legend
	   		const labels = d3.select('.legend')
	   			.selectAll('.bird')
	   				.data(birds).enter()
	   			.append("p")
	   				.attr("class", "bird")
		   	
		   	labels
		   		.append("span")
		   		.attr("class", "icon")
		   		.style("background-color", (d) => d.color || "black");

		   	labels
		   		.append("span")
		   		.html((d) => d.bird);
	   })
	   .catch((e) => console.log(e));

	function getSeeds(feeder) {
		return feeder.seeds.map((s) => s.seed);
	}

	function getBirds(feeder, allBirds) {
		const birds = Object.keys(feeder.seeds[0])
					 .filter((x) => (x !== "seed")); 

		return birds.sort((a, b) => {
			const aId = allBirds.findIndex((d) => d.bird === a);
			const bId = allBirds.findIndex((d) => d.bird === b);
			return aId - bId;
		})
	}