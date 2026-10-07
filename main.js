import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import "./style.css";

//To make the points
import { fromLonLat, toLonLat } from "ol/proj";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Point } from "ol/geom";

//to style the points
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";

// Center point layer
const centerCoords = fromLonLat([13.81823, 57.16121]); // Transform lon/lat to map projection
const centerFeat = new Feature({ geometry: new Point(centerCoords) });
const vectorSourceCenter = new VectorSource({ features: [centerFeat] });
const pointLayer = new VectorLayer({
  source: vectorSourceCenter,
  style: new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: "blue" }),
      stroke: new Stroke({ color: "black", width: 2 }),
    }),
  }),
});

// Click points layer
const clickPointCoords = fromLonLat([13.73, 57.36]);
const pointFeat = new Feature({ geometry: new Point(clickPointCoords) });
pointFeat.set("type", "origin"); // Set a custom property to identify the feature
const vectorSourceClick = new VectorSource( { features: [pointFeat] });
const clickLayer = new VectorLayer({
  source: vectorSourceClick,
  style: new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: "red" }),
      stroke: new Stroke({ color: "black", width: 2 }),
    }),
  }),
});

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    pointLayer,
    clickLayer,
  ],
  view: new View({
    center: centerCoords,
    zoom: 2,
  }),
});

function updateCounter() {
  document.getElementById("pointsCounter").value =
    "Number of points: " + vectorSourceClick.getFeatures().length; // Update the points counter
}

updateCounter(); // Initial update of the points counter

document.getElementById("clear-btn").addEventListener("click", function () {
  vectorSourceClick
    .getFeatures()
    .filter((feature) => feature.get("type") === "newPoint") // Only get the points with the type "newPoint"
    .forEach((feature) => vectorSourceClick.removeFeature(feature)); // Removes the filetered features from the vector source
  updateCounter(); // Update the points counter
    
});

document.getElementById("forsheda-btn").addEventListener("click", function() {
  map.getView().animate({
    center: centerCoords,
    zoom: 19,
    duration: 2000, // Animation duration in milliseconds
  })
})

map.on("click", function (event) {
  const lonLat = toLonLat(event.coordinate); // Convert the clicked coordinate to lon/lat
  console.log(lonLat); // Log the lon/lat to the console

  const hit = map.forEachFeatureAtPixel(event.pixel, function (feature) {
    return feature;
  });

  if (hit) {
    console.log("Clicked on a feature:", hit);
    vectorSourceClick.removeFeature(hit); // Remove the clicked feature from the vector source
  } else {
    const newPoint = new Feature({ geometry: new Point(event.coordinate) });
    newPoint.set("type", "newPoint"); // Set a custom property to identify the feature
    vectorSourceClick.addFeature(newPoint); // Add a new feature to the vector source
  }
  updateCounter(); // Update the points counter
});
