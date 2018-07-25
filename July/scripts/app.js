
	d3.json("data/feeders.json")
	   .then((feeders) => {
	   		feeders.forEach((f) => {
	   			const birds = Object.keys(f.seeds[0])
	   								.filter((x) => (x !== "seed")); 
    			
    			const stack = d3.stack()
    						.keys(birds)
	   						.order(d3.stackOrderNone)
    						.offset(d3.stackOffsetNone);

    			const data = stack(f.seeds);
    			console.log(f.feeder);
    			console.log(data);
	   		});
	   })
	   .catch((e) => console.log(e));