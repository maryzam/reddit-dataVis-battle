
import * as d3 from "d3";

const rad2deg = 180 / Math.PI;

class SkyMap {

  constructor(selector, data) {
      const ph = d3.select(selector);
      const size = ph.node().getBoundingClientRect();

      this.data = data;
      this.size = size;

      this.setupProjection();
      this.setupScales();
      this.setupContainers(ph);
      this.addHandlers();

      this.render();
  }

  setupProjection() {
      const scale = Math.max(this.size.width, this.size.height) * 0.4;
      this.projection = d3.geoStereographic()
            .scale(scale)
            .clipAngle(120)
            .translate([
                this.size.width/2,
                this.size.height/2 
            ]);

      this.path = d3.geoPath().projection(this.projection);
  }

  setupScales() {
      const lambda = d3.scaleLinear()
            .domain([0, this.size.width])
            .range([-180, 180]);

      const phi = d3.scaleLinear()
            .domain([0, this.size.height])
            .range([90, -90]);
          
      const radius = d3.scaleLinear()
            .domain([-20, 6])
            .range([15, 1])
            .clamp(true);
          
      const color = d3.scaleLinear()
            .domain([-0.4, 0.5, 1.5, 3.0, 5.0])
            .range(["#7AF7FF", "#ffffff",  "#FFD230", "#FF8400", "#FF3E00"])
            .clamp(true);

      this.scale = { lambda, phi, radius, color };
  }

  setupContainers(placeholder) {
      this.container = placeholder
                        .append("svg")
                          .attr("width", this.size.width)
                          .attr("height", this.size.height);

      this.container
              .append("path")
                  .attr("class", "graticule")
                  .datum(d3.geoGraticule());

      this.container
              .append("g")
                  .attr("class", "stars");
  }

  addHandlers() {
      const { lambda, phi } = this.scale;
      this.container
        .on("mousemove", () => {
            const { pageX, pageY } = d3.event;
            this.projection.rotate([lambda(pageX), phi(pageY)]);
            this.render();
        });   
  }

  setProjection(d) {
      const pos = this.projection([d.Pos.Ra, d.Pos.Dec]);
      d.x = pos[0];
      d.y = pos[1];
      return d;
  }

  render() {

    const info = this.data.map((d) => this.setProjection(d));

    this.container
          .select(".graticule")
          .attr("d", this.path);

    const stars = this.container
            .select(".stars")
              .selectAll("circle")
              .data(info);
          
     stars
        .enter()
        .append("circle")
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })
            .attr("r", (d) => { return this.scale.radius(d.Magnitude); })
            .style("fill", (d) => { return this.scale.color(d.ColorIndex); });
      
    stars
        .merge(stars)
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
}

export default SkyMap;
