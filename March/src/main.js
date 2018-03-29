
import * as d3 from "d3"

var width = 960,
    height = 600;
    
    var projection = d3.geoStereographic()
      .scale(400)
      .clipAngle(120)
      .translate([width/2, height/2]);
      
    var path = d3.geoPath()
      .projection(projection);
    
    var lambda = d3.scaleLinear()
      .domain([0, width])
      .range([-180, 180]);
    
    var phi = d3.scaleLinear()
      .domain([0, height])
      .range([90, -90]);
    
    var radius = d3.scaleLinear()
      .domain([-1, 5])
      .range([8, 1])
      .clamp(true);
    
    var color = d3.scaleLinear()
      .domain([-0.2, 0.5, 1.6])
      .range(["#e6f0ff", "#ffffff", "fff5e6"])
      .clamp(true);
    
    var svg = d3.select(".container").append("svg")
      .attr("width", width)
      .attr("height", height);
    
    svg.append("path")
      .attr("class", "graticule")
      .datum(d3.geoGraticule());
    
    svg.append("g")
      .attr("class", "stars");
    
    d3.json("data/all-visible.json")
      .then(function(data) {
    
        function render() {
      
          svg.select(".graticule")
            .attr("d", path);
        
          var stars = svg.select(".stars")
            .selectAll("circle")
            .data(data.map(function(d) {
              var p = projection([
                  -d.Position.Ra * 180 / Math.PI, 
                  d.Position.Dec * 180 / Math.PI
              ]);
              d[0] = p[0];
              d[1] = p[1];   
              return d;   
            }));
          
          stars.enter().append("circle")
            .attr("r", function(d) { return radius(d.Magnitude); })
            .style("fill", function(d) { return color(d.ColorIndex); });
      
          stars
            .attr("cx", function(d) { return d[0]; })
            .attr("cy", function(d) { return d[1]; });
        }
      
        render();
      
        svg.on("mousemove", function() {
          var p = d3.mouse(this);
          projection.rotate([lambda(p[0]), phi(p[1])]);
          render();
        });                 
    
    });
    