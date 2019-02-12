import '@babel/polyfill'

import L from 'leaflet'

import { AdvancedHeatmapLayer } from 'leaflet-advanced-heatmap'

const map = L.map('map').setView([51.505, -0.09], 13)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

const numOfPoints = 1000

const width = 2
const height = 2

let x = width / 2
let y = height / 2

// Brownian (random) motion
let data = []
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
    500 + 500 * Math.random(),
    // alpha
    2 * Math.PI * Math.random(),
    // delta alpha
    0
  ])
}

const layer = new AdvancedHeatmapLayer(data, {
  heatmap: {
    smooth: false,
    features: {
      alpha: {
        source: {
          idx: 3,
          min: 0,
          max: 2 * Math.PI
        },

        value: {
          min: 0.1,
          max: 0.8
        }
      }
    }
  }
})
layer.addTo(map)

setInterval(() => {
  data = data.map(([x, y, z, alpha, deltaAlpha]) => [
    x + Math.sin(alpha) / z / 10,
    y + Math.cos(alpha) / z / 10,
    z,
    Math.max(Math.min(alpha + deltaAlpha, 2 * Math.PI), 0),
    deltaAlpha + (Math.random() - .5) / 10
  ])
  layer.setLatLngs(data);
}, 1000 / 10);
