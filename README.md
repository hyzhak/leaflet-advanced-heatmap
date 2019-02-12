# leaflet-advanced-heatmap
Advanced heat map plugin for Leaflet

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
