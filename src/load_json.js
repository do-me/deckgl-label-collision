import { Deck } from '@deck.gl/core';
import { TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CollisionFilterExtension } from '@deck.gl/extensions';

// Fetch the remote JSON file and process it
async function fetchData() {
  const response = await fetch("https://corsproxy.io/?https://github.com/do-me/SDG-Analyzer/raw/main/assets/SDG_Target_2023_jina_base_dim_reduction.json");
  const data = await response.json();

  // Convert the object to an array of objects
  const dataArray = Object.keys(data.SDGNumber).map(key => ({
    SDGNumber: data.SDGNumber[key],
    SDGTitle: data.SDGTitle ? data.SDGTitle[key] : null, // Ensure this line is correct
    TargetsNumber: data.TargetsNumber ? data.TargetsNumber[key] : null,
    Targets: data.Targets ? data.Targets[key] : null,
    x: data.x ? data.x[key] : null,
    y: data.y ? data.y[key] : null
  }));

  // Process data to fit the format for layers
  return dataArray.map(item => ({
    position: [item.x, item.y],
    SDGTitle: item.SDGTitle,
    tooltipText: `SDGNumber: ${item.SDGNumber}<br>SDGTitle: ${item.SDGTitle}<br>TargetsNumber: ${item.TargetsNumber}<br>Targets: ${item.Targets}`,
  }));
}

let tooltip = document.getElementById('tooltip');
let deck; // Store the deck instance
let data; // Store the fetched data

// Initial fontSize and sizeMinPixels values for the text layer
let fontSize = 32; // set a default or calculate based on your needs
let sizeMinPixels = 10; // set a default or calculate based on your needs

function showTooltip({ x, y, object }) {
  if (object) {
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = object.tooltipText;
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }
}

function getScatterplotLayer() {
  return new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: data,
    getPosition: d => d.position,
    getFillColor: [255, 140, 0],
    getRadius: 1,
    radiusMinPixels: 2,
    radiusMaxPixels: 30,
    pickable: true,
    autoHighlight: true,
    onHover: showTooltip,
  });
}

function getTextLayer() {
  return new TextLayer({
    id: 'text-layer',
    data: data,
    getPosition: d => d.position,
    getText: d => `${d.SDGTitle}`,
    getSize: fontSize,
    extensions: [new CollisionFilterExtension()],
    collisionEnabled: true,
    getPixelOffset: [0, +20],
    collisionTestProps: {
      radiusScale: 200,
      sizeMinPixels: sizeMinPixels,
    },
    getCollisionPriority: d => -d.tooltipText.length,
  });
}

function updateLayers() {
  if (deck) {
    deck.setProps({
      layers: [getScatterplotLayer(), getTextLayer()]
    });
  }
}

function createLayers(fetchedData) {
  // Save the fetched data for later use
  data = fetchedData;

  // When initializing the Deck instance
  deck = new Deck({
    initialViewState: {
      longitude: 0.5,
      latitude: 0.5,
      zoom: 10,
    },
    pickingRadius: 50,
    controller: true,
    layers: [getScatterplotLayer(), getTextLayer()],
    container: document.getElementById('map')
  });
}

// Call fetchData and then create the layers with the fetched data
fetchData().then(fetchedData => {
  createLayers(fetchedData);
});

// Update your slider event listeners to call updateLayers with the fetched data
document.getElementById('fontSizeSlider').addEventListener('input', function(event) {
  fontSize = parseInt(event.target.value, 10);
  document.getElementById('fontSizeValue').innerText = fontSize;
  updateLayers();
});

document.getElementById('sizeMinPixelsSlider').addEventListener('input', function(event) {
  sizeMinPixels = parseInt(event.target.value, 10);
  document.getElementById('sizeMinPixelsValue').innerText = sizeMinPixels;
  updateLayers();
});