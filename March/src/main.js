 
import { json, csv, select } from "d3";

import 'intersection-observer';
import scrollama from 'scrollama';

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

      const viz = {
          counts: new ConstellationsPack(".stars-count", constStats),
          distances: new DistanceStats(".distances", constStats),
          magnitudes: new MagnitudeStats(".magnitudes", constStats),
          colors: new ColorStats(".colors", constStats)
      };

      const scroller = scrollama();
      scroller.setup({
        step: '.part',
        once: true
      })
      .onStepEnter(function(r) { 
          const step = select(r.element).attr("data-step");
          if (!!viz[step]) {
            console.log(step + " show");
              viz[step].show();
          }
      });

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