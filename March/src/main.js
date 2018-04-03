 
import { json, csv } from "d3";
import SkyMap from "./components/skyMap";
import ConstellationsPack from "./components/overview/constellationsPack";
import { renderDistances } from "./components/overview/renderDistances";
import { renderMagnitudes } from "./components/overview/renderMagnitudes";
import { renderColors } from "./components/overview/colorStats";


Promise.all([
      json("data/all-visible.json"),
      json("data/constellations.json"),
      csv("data/constellation-names.csv")
  ])
  .then((result) => {
      const stars = result[0];
      const constStats = result[1];
      const constNames = result[2];

      combineData(constStats, constNames);

      const constellations = new ConstellationsPack(".stars-count", constStats);
      const distances = renderDistances(".distances", constStats);
      const magnitude = renderMagnitudes(".magnitudes", constStats);
      const colors = renderColors(".colors", constStats);
      const skyMap = new SkyMap(".sky-map", stars);
  });

function combineData(data, dict) {
     data.forEach(function(d) {
          var info = dict.find(function(item) { return item.Abbreviation === d.Name; });
          d["FullName"] = info.Name;
          d["Family"] = info.Family;
    });
}