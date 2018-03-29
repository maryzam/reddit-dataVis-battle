
import { json } from "d3";
import SkyMap from "./components/skyMap";

json("data/all-visible.json")
    .then(function(stars) {
        const skyMap = new SkyMap(".sky-map", stars);
    });
