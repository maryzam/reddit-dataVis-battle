var statesGrid = { columns: 5, rows: 10 };
var cellSize = { width: 190, height: 100 };
var maxRadius = (Math.floor(cellSize.height / 2) - 15);

var scaleRadius = d3.scaleLinear()
					.domain([0, 20])
					.range([10, maxRadius]);

var legalStatuses = ["No Law", "Statutory Ban", "Constitutional Ban", "Legal"]		
var scaleColor = d3.scaleOrdinal()
				   .domain(legalStatuses)
				   .range(["#dadada", "#F13C05", "#FF7747", "#35D4DA"]);