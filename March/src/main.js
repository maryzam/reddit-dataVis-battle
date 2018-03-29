 
import { json, csv } from "d3";
import SkyMap from "./components/skyMap";
import StellarFilter from "./components/stellarFilter";
import { renderStarsNumber } from "./components/overview/renderStarsNumber";


Promise.all([
      json("data/all-visible.json"),
      json("data/constellations.json"),
      csv("data/constellation-names.csv")
  ])
  .then((result) => {
      const stars = result[0];
      const constStats = result[1];
      const constNames = result[2];

      const navigation = new StellarFilter(".filters", constNames)
      const skyMap = new SkyMap(".sky-map", stars);

      renderStarsNumber(".stars-count", constStats, constNames);
  });
