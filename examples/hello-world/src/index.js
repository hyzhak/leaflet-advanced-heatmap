import '@babel/polyfill'

import L from 'leaflet'

import { AdvancedHeatmapLayer } from 'leaflet-advanced-heatmap'

const map = L.map('map').setView([51.505, -0.09], 13)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

L.marker([51.5, -0.09]).addTo(map)
  .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  .openPopup()

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

const layer = new AdvancedHeatmapLayer(data)
layer.addTo(map)
