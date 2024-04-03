import { Deck } from '@deck.gl/core';
import { TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { CollisionFilterExtension } from '@deck.gl/extensions';

// Generate 1000 random data points with coordinates between 0 and 1
const data = Array.from({ length: 1000 }, () => ({
    position: [Math.random(), Math.random()], // Coordinates between 0 and 1
    label: Math.random().toString(36).substring(2, 7),
  }));

let tooltip = document.getElementById('tooltip');

function showTooltip({ x, y, object }) {
  if (object) {
    tooltip.style.top = `${y}px`;
    tooltip.style.left = `${x}px`;
    tooltip.innerHTML = `Position: ${object.position}<br>Label: ${object.label || 'N/A'}`;
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }
}

// Function to generate a scatterplot layer with tooltip event handling
const getScatterplotLayer = () => new ScatterplotLayer({
  id: 'scatterplot-layer',
  data: data,
  getPosition: d => d.position,
  getFillColor: [255, 140, 0],
  getRadius: 1,
  radiusMinPixels: 2,
  radiusMaxPixels: 30, // Increase if you want a larger hover area
  pickable: true,
  autoHighlight: true,
  onHover: showTooltip,
});

// Initial fontSize and sizeMinPixels values for the text layer
let fontSize = parseInt(document.getElementById('fontSizeSlider').value);
let sizeMinPixels = parseInt(document.getElementById('sizeMinPixelsSlider').value);

const getTextLayer = () => new TextLayer({
    id: 'text-layer',
    data: data,
    getPosition: d => d.position,
    getText: d => d.label,
    getSize: fontSize,
    extensions: [new CollisionFilterExtension()],
    collisionEnabled: true,
    getPixelOffset: [0, +20],
    collisionTestProps: {
      radiusScale: 200,
      sizeMinPixels: sizeMinPixels,
    },
    getCollisionPriority: d => -d.label.length,
  });
  
  // When initializing the Deck instance
  const deck = new Deck({
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
  
  function updateLayers() {
    deck.setProps({
      layers: [getScatterplotLayer(), getTextLayer()]
    });
  }  

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