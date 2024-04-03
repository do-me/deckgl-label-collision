import { Deck } from '@deck.gl/core';
import { TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CollisionFilterExtension } from '@deck.gl/extensions';

// Convert HEX color codes to RGB arrays
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

const colorArray = [
  "#E5243B", "#DDA63A", "#4C9F38", "#C5192D", "#FF3A21", "#26BDE2", "#FCC30B",
  "#A21942", "#FD6925", "#DD1367", "#FD9D24", "#BF8B2E", "#3F7E44", "#0A97D9",
  "#56C02B", "#00689D", "#19486A"
];

// Create the SDGColors object by converting each HEX color to RGB
const SDGColors = colorArray.reduce((acc, color, index) => {
  acc[index + 1] = hexToRgb(color);
  return acc;
}, {});

// Fetch the remote JSON file and process it
async function fetchData() {
  const response = await fetch("https://github.com/do-me/SDG-Analyzer/raw/main/assets/SDG_Target_2023_jina_base_dim_reduction.json");
  const data = await response.json();

  // Convert the object to an array of objects
  const dataArray = Object.keys(data.SDGNumber).map(key => ({
    SDGNumber: data.SDGNumber[key],
    SDGTitle: data.SDGTitle ? data.SDGTitle[key] : null,
    TargetsNumber: data.TargetsNumber ? data.TargetsNumber[key] : null,
    Targets: data.Targets ? data.Targets[key] : null,
    x: data.x ? data.x[key] : null,
    y: data.y ? data.y[key] : null
  }));

  // Process data to fit the format for layers
  return dataArray.map(item => ({
    position: [item.x, item.y],
    SDGNumber: item.SDGNumber,
    SDGTitle: item.SDGTitle,
    tooltipText: `SDGNumber: ${item.SDGNumber}<br>SDGTitle: ${item.SDGTitle}<br>TargetsNumber: ${item.TargetsNumber}<br>Targets: ${item.Targets}`,
  }));
}

let tooltip = document.getElementById('tooltip');
let deck; // Store the deck instance
let data; // Store the fetched data

// Initial fontSize and sizeMinPixels values for the text layer
let fontSize = parseInt(document.getElementById('fontSizeSlider').value);
let sizeMinPixels = parseInt(document.getElementById('sizeMinPixelsSlider').value);

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
    getFillColor: d => SDGColors[d.SDGNumber] || [255, 255, 255], // Fallback to white if no color is defined
    getRadius: 5,
    radiusScale: 100,
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