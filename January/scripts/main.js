d3.json("data/algae-growth.json", function(error, source) {
	if (error) throw error;
	
	console.log(source);
});
