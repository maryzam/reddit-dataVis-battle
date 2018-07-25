
	d3.json(" data/birds.json")
	   .then((source) => {

	   		const feeders = getFeeders(source);
	   		console.log(feeders);
    		for (let feederType in feeders) {

    			const feeder = feeders[feederType]
    			const birds = Object.keys(feeder[0]).filter((x) => (x !== "seed")); 
    			
    			const stack = d3.stack()
    						.keys(birds)
	   						.order(d3.stackOrderNone)
    						.offset(d3.stackOffsetNone);

    			const data = stack(feeder);
    			console.log(feederType);
    			console.log(data);
    			console.log();
    		}
	   });


	function getFeeders(birds) {
		const feeders = {};
		birds.forEach((b) => {
			b.feeders.forEach((f) => {
				if (!feeders[f]) {
					feeders[f] = [];
				}
				feeders[f].push(b);
			})
		});

		const seeds = Object.keys(birds[0].seeds);

		for (let feederType in feeders) {
			const info = [];
			const feeder = feeders[feederType];
			seeds.forEach((seed) => {
				const current = { seed };
				let total = 0;
				feeder.forEach((b) => {
					current[b.bird] = b.seeds[seed];
					total += b.seeds[seed]; 
				});			
				if (total > 0) {
					info.push(current);
				}				
			});
			feeders[feederType] = info;
		}

		return feeders;
	}

