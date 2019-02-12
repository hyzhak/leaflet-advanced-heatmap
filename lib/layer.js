import AdvancedHeatMap from 'advanced-heatmap'
import L, { Layer } from 'leaflet'

/**
 * official heatmap (https://github.com/Leaflet/Leaflet.heat)
 * makes canvas for whole page
 * - cons: move or any tiny update leads to complete redraw whole canvas
 * - pros: we don't need to solve local-global problem by filtering visible items
 *
 * https://github.com/pa7/heatmap.js/tree/master/plugins/leaflet-heatmap
 * - pros + cons: same as the official heatmap - uses a single canvas
 *
 *
 * # TODO:
 *
 * - DONE: scale radius of points based on map scale
 * - ?: extend Renderer
 * - CANCEL: support retina if (Browser.retina) { this._ctx.scale(2, 2); }
 *   - we may not need it because heat map are blur by nature
 * - check heatmap animation
 * - webgl and fallback to canvas 2d
 * - performance: reuse previous canvas
 */

export default class AdvancedHeatmapLayer extends Layer {
  constructor (...args) {
    super(...args)

    this._scaleByMeters = this._scaleByMeters.bind(this)
    this._scaleByPixels = this._scaleByPixels.bind(this)
  }

  initialize (latlngs, options) {
    this._latlngs = latlngs
    L.setOptions(this, options)
  }

  setLatLngs (latlngs) {
    this._latlngs = latlngs
    return this.redraw()
  }

  addLatLng (latlng) {
    this._latlngs.push(latlng)
    return this.redraw()
  }

  setOptions (options) {
    L.setOptions(this, options)
    if (this._heat) {
      this._updateOptions()
    }
    return this.redraw()
  }

  redraw () {
    if (this._heat && !this._frame && this._map && !this._map._animating) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this)
    }
    return this
  }

  onAdd (map) {
    this._map = map

    if (!this._canvas) {
      this._initCanvas()
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas)
    } else {
      map._panes.overlayPane.appendChild(this._canvas)
    }

    map.on('moveend', this._reset, this)

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this)
    }

    this._reset()
  }

  onRemove (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas)
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas)
    }

    map.off('moveend', this._reset, this)

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this)
    }
  }

  addTo (map) {
    map.addLayer(this)
    return this
  }

  _initCanvas () {
    const canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer')

    const originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin'])
    canvas.style[originProp] = '50% 50%'

    const size = this._map.getSize()
    canvas.width = size.x
    canvas.height = size.y

    const animated = this._map.options.zoomAnimation && L.Browser.any3d
    L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'))

    this._heat = new AdvancedHeatMap({
      canvas,
      smooth: 0.5,
      valueToOpacity: true,
      features: {
        radius: {
          source: {
            idx: 2,
            // TODO: setup
            min: 0,
            max: 1
          },

          // TODO: setup
          value: {
            min: 1,
            max: 8
          }
        },

        alpha: {
          source: {
            idx: 3,
            min: 0,
            max: 50
          },

          value: {
            min: 0.1,
            max: 0.8
          }
        }
      }
    })
    this._updateOptions()
  }

  _updateOptions () {
    // TODO:
    // this._heat.radius(this.options.radius || this._heat.defaultRadius, this.options.blur);
    //
    // if (this.options.gradient) {
    //   this._heat.gradient(this.options.gradient);
    // }
    // if (this.options.max) {
    //   this._heat.max(this.options.max);
    // }
  }

  _reset () {
    let topLeft = this._map.containerPointToLayerPoint([0, 0])
    L.DomUtil.setPosition(this._canvas, topLeft)

    // let size = this._map.getSize()

    // TODO:
    // if (this._heat._width !== size.x) {
    //   this._canvas.width = this._heat._width = size.x;
    // }
    // if (this._heat._height !== size.y) {
    //   this._canvas.height = this._heat._height = size.y;
    // }

    this._redraw()
  }

  _redraw () {
    if (!this._map) {
      return
    }

    const maxR = 100

    const size = this._map.getSize()

    const bounds = new L.Bounds(
      L.point([-maxR, -maxR]),
      size.add([maxR, maxR]))

    console.time('prepare data')
    const data = []

    // TODO: another option is this._scaleByPixels
    const scaleBy = this._scaleByMeters

    for (let i = 0, len = this._latlngs.length; i < len; i++) {
      const pointSource = this._latlngs[i]
      const latLng = new L.LatLng(...pointSource)
      const p = this._map.latLngToContainerPoint(latLng)
      if (bounds.contains(p)) {
        // scale based on lng
        const pointScaleInPx = scaleBy(
          new L.LatLng(...this._latlngs[0]),
          // TODO: for the moment size is 3rd field and 4th is opacity
          // but it could be different
          pointSource[2]
        )
        data.push([
          Math.round(p.x),
          Math.round(p.y),
          pointScaleInPx,
          pointSource[2]
        ])
      }
    }
    console.timeEnd('prepare data')

    // console.time('draw ' + data.length);
    // this._heat.data(data).draw(this.options.minOpacity);
    this._heat.removeAll()
    data.forEach(item => this._heat.add(item))

    console.time('render')
    this._heat.render().then(() => {
      console.timeEnd('render')
    })
    // console.timeEnd('draw ' + data.length);

    this._frame = null
  }

  _scaleByPixels (latlng, size = 1) {
    return size
  }

  _scaleByMeters (latlng, size = 1) {
    // necessary to maintain accurately sized circles
    // to change scale to miles (for example), you will need to convert 40075017 (equatorial circumference of the Earth in metres) to miles
    const map = this._map

    const lngRadius = (size / 40075017) *
              360 /
              Math.cos((Math.PI / 180) * latlng.lat)

    const latlng2 = new L.LatLng(latlng.lat, latlng.lng - lngRadius)

    const point = map.latLngToLayerPoint(latlng)

    const point2 = map.latLngToLayerPoint(latlng2)

    return Math.max(Math.round(point.x - point2.x), 1)
  }

  _animateZoom (e) {
    const scale = this._map.getZoomScale(e.zoom)
    const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos())

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale)
    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')'
    }
  }
}
