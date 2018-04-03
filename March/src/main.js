 
import { json, csv } from "d3";
import SkyMap from "./components/skyMap";
import ConstellationsPack from "./components/overview/constellationsPack";
import DistanceStats from "./components/overview/distanceStats";
import MagnitudeStats from "./components/overview/magnitudeStats";
import ColorStats from "./components/overview/colorStats";


Promise.all([
      json("data/constellations.json"),
      csv("data/constellation-names.csv")
  ])
  .then((result) => {
      const constStats = result[0];
      const constNames = result[1];

      combineData(constStats, constNames);

      const constellations = new ConstellationsPack(".stars-count", constStats);
      const distances = new DistanceStats(".distances", constStats);
      const magnitudes = new MagnitudeStats(".magnitudes", constStats);
      const colors = new ColorStats(".colors", constStats);

      constellations.show();
      setTimeout(function() { 
        colors.show(); 
        magnitudes.show();
        distances.show();
      }, 2000);
  });

json("data/all-visible.json")
    .then((stars) => {
        const skyMap = new SkyMap(".sky-map", stars);
  });

function combineData(data, dict) {
     data.forEach(function(d) {
          var info = dict.find(function(item) { return item.Abbreviation === d.Name; });
          d["FullName"] = info.Name;
          d["Family"] = info.Family;
    });
}