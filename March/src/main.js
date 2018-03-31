 
import { json, csv } from "d3";
import SkyMap from "./components/skyMap";
import { renderStarsNumber } from "./components/overview/renderStarsNumber";
import { renderDistances } from "./components/overview/renderDistances";
import { renderMagnitudes } from "./components/overview/renderMagnitudes";
import { renderColors } from "./components/overview/renderColors";


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

      const skyMap = new SkyMap(".sky-map", stars);

      renderStarsNumber(".stars-count", constStats);
      renderDistances(".distance", constStats);
      renderMagnitudes(".magnitude", constStats);
      renderColors(".colors", constStats);
  });

function combineData(data, dict) {
     data.forEach(function(d) {
          var info = dict.find(function(item) { return item.Abbreviation === d.Name; });
          d["FullName"] = info.Name;
          d["Family"] = info.Family;
    });
}