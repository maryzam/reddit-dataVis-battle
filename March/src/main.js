
import * as d3 from "d3"

const rad2deg = 180 / Math.PI;

const container = d3.select(".container");
const size = container.node().getBoundingClientRect();

const projection = d3.geoStereographic()
      .scale(400) //todo based on size
      .clipAngle(120)
      .translate([ size.width/2, size.height/2 ]);
      
const path = d3.geoPath().projection(projection);
    
const lambda = d3.scaleLinear()
      .domain([0, size.width])
      .range([-180, 180]);
    
const phi = d3.scaleLinear()
      .domain([0, size.height])
      .range([90, -90]);
    
const radius = d3.scaleLinear()
      .domain([-20, 6])
      .range([15, 1])
      .clamp(true);
    
const color = d3.scaleLinear()
      .domain([-0.4, 0.5, 1.5, 3.0, 5.0])
      .range(["#7AF7FF", "#ffffff",  "#FFD230", "#FF8400", "#FF3E00"])
      .clamp(true);
    
const svg = container
      .append("svg")
        .attr("width", size.width)
        .attr("height", size.height);
    
    d3.json("data/all-visible.json")
      .then(function(data) {

        const skyMap = svg.append("g").attr("class", "stars");
        const graticule = svg.append("path")
                .attr("class", "graticule")
                .datum(d3.geoGraticule());
    
        function render() {
      
          graticule.attr("d", path);

          var stars = skyMap
            .selectAll("circle")
            .data(data
                .map(function(d) {
                  var p = projection([d.Pos.Ra, d.Pos.Dec]);
                  d.x = p[0];
                  d.y = p[1];   
                  return d;   
                })
            );
          
          stars
            .enter()
            .append("circle")
              .attr("r", function(d) { return radius(d.Magnitude); })
              .style("fill", function(d) { return color(d.ColorIndex); });
      
          stars
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        }
      
        render();
      
        svg.on("mousemove", function() {
          var p = d3.mouse(this);
          projection.rotate([lambda(p[0]), phi(p[1])]);
          render();
        });                 
    
    });
    