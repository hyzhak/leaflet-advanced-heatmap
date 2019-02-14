# leaflet-advanced-heatmap [![Build Status](https://travis-ci.org/hyzhak/leaflet-advanced-heatmap.svg?branch=master)](https://travis-ci.org/hyzhak/leaflet-advanced-heatmap)
Advanced heat map plugin for Leaflet. Depends on [heatmap module](https://github.com/hyzhak/advanced-heatmap-js/)

## Usage

```javascript

new AdvancedHeatmapLayer(data, {
  heatmap: {
    smooth: 1.0
  }
}).addTo(map)

```

## Example

```javascript
import L from 'leaflet'

import { AdvancedHeatmapLayer } from 'leaflet-advanced-heatmap'

const numOfPoints = 1000

const width = 2
const height = 2

let x = width / 2
let y = height / 2

// Brownian (random) motion
const data = []
const step = 0.01
for (let i = 0; i < numOfPoints; i++) {
  x += step * Math.random() - step / 2
  y += step * Math.random() - step / 2
  if (x > width) {
    x -= width
  } else if (x < 0) {
    x += width
  }
  if (y > height) {
    y -= height
  } else if (y < 0) {
    y += height
  }
  data.push([
    x + 51.5 - width / 2,
    y - 0.09 - height / 2,
    50 * Math.random()//, 0.1 + 0.2 * Math.random()
  ])
}

const map = L.map('map').setView([51.505, -0.09], 13)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

new AdvancedHeatmapLayer(data, {
  heatmap: {
    smooth: 1.0
  }
}).addTo(map)

```

## Architecture

### Compare base options:
- Layer (base) just as it is

- [GridLayer](https://leafletjs.com/reference-1.4.0.html#gridlayer) [and](https://leafletjs.com/examples/extending/extending-2-layers.html#lgridlayer-and-dom-elements)
  - *pros* `createTile` method which we can use to create small canvas tile.
  - *pros* `createTile` method has old node.js style `done` method, for async
  - *question* we are getting coords.x, coords.y, coords.z in `createTile`
    how could we know canvas width and height? The answer is `this.getTileSize()`
  - [TileLayer](https://leafletjs.com/reference-1.4.0.html#tilelayer) [and](https://leafletjs.com/examples/extending/extending-2-layers.html#extension-methods)
    - *cons:* its purpose to load and show images from url
      by customize by overwriting #getTileUrl

- Renderer
  - Canvas https://leafletjs.com/reference-1.4.0.html#canvas

### Theory
- [architecture of layers](https://leafletjs.com/examples/extending/extending-1-classes.html#leaflet-architecture)
- [how to extend](https://leafletjs.com/examples/extending/extending-2-layers.html)
