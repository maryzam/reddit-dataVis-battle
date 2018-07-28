
	d3.json("data/feeders.json")
	   .then((feeders) => {

	   		const width = 400;
	   		const height = 400;

	   		// add container
	   		const svg = d3.select('main')
	   						.append('svg')
	   						.attr("width", width)
	   						.attr("height", height * feeders.length);

	   		// get data categories
	   		const allSeeds = getAllSeeds(feeders);
	   		const allBirds = getAllBirds(feeders);

	   		// prepare scales
	   		const maxRadius = height / 2 - 10;
	   		const minRadius = Math.max(maxRadius * 0.1, 25);
	   		const scaleRadius = d3.scaleLinear().range([minRadius, maxRadius]);

	   		const scaleAngle = d3.scalePoint()
	   								.domain(allSeeds)
	   								.range([0, Math.PI * 2]);

	   		const scaleColor = d3.scaleSequential(d3.interpolatePlasma)
    							 .domain([0, allBirds.length]);

    		// prepare radial area generator
    		const area = d3.areaRadial()
	    					.angle((d) => scaleAngle(d.data.seed))
	    					.innerRadius((d) => scaleRadius(d[0])) 
	    					.outerRadius((d) => scaleRadius(d[1])) 
	    					.curve(d3.curveCardinalClosed.tension(0.5));

    		const scaleBirds = (d) => {
    			const id = allBirds.indexOf(d);
    			return scaleColor(id);
    		}

	   		feeders.forEach((f, i) => {

	   			const birds = getBirds(f);

    			const stack = d3.stack()
    						.keys(birds)
	   						.order(d3.stackOrderNone)
    						.offset(d3.stackOffsetNone);

    			const data = stack(f.seeds);

    			// prepare scales
    			const max = d3.max(data, (d) => d3.max(d, (x) => x[1]));
    			scaleRadius.domain([ 0, max ]);

				// prepare container
				const offset = { x: width / 2, y: height / 2}
    			const container = svg.append("g")
    								.attr("dataFeeder", f.feeder)
    								.attr("transform", `translate(${offset.x}, ${ i * height + offset.y})`);
    			// draw chart
    			container
    				.selectAll('.seed')
    					.data(data).enter()
    				.append('path')
    					.attr('class', 'seed')
    					.attr("d", (d) => area(d))
      					.style("fill", (d) => scaleBirds(d.key))
      					.style("stroke", "none");
	   		});
	   })
	   .catch((e) => console.log(e));

	function getAllSeeds(feeders) {
		const seeds = {};
		feeders.forEach((f) => {
			f.seeds.forEach((s) => {
				seeds[s.seed] = true;
			});
		});
		return Object.keys(seeds);
	}

	function getAllBirds(feeders) {
		const birds = [];
		feeders.forEach((f) => {
			const curr = getBirds(f);
			birds.push(...curr);
		});
		return Array.from(new Set(birds));
	}

	function getBirds(feeder) {
		return Object.keys(feeder.seeds[0])
					 .filter((x) => (x !== "seed")); 
	}