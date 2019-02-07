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
 */

export default class AdvancedHeatmapLayer extends Layer {
  initialize (latlngs, options) {
    this._latlngs = latlngs;
    L.setOptions(this, options);
  }

  setLatLngs (latlngs) {
    this._latlngs = latlngs;
    return this.redraw();
  }

  addLatLng (latlng) {
    this._latlngs.push(latlng);
    return this.redraw();
  }

  setOptions (options) {
    L.setOptions(this, options);
    if (this._heat) {
      this._updateOptions();
    }
    return this.redraw();
  }

  redraw () {
    if (this._heat && !this._frame && this._map && !this._map._animating) {
      this._frame = L.Util.requestAnimFrame(this._redraw, this);
    }
    return this;
  }

  onAdd (map) {
    this._map = map;

    if (!this._canvas) {
      this._initCanvas();
    }

    if (this.options.pane) {
      this.getPane().appendChild(this._canvas);
    } else {
      map._panes.overlayPane.appendChild(this._canvas);
    }

    map.on('moveend', this._reset, this);

    if (map.options.zoomAnimation && L.Browser.any3d) {
      map.on('zoomanim', this._animateZoom, this);
    }

    this._reset();
  }

  onRemove (map) {
    if (this.options.pane) {
      this.getPane().removeChild(this._canvas);
    } else {
      map.getPanes().overlayPane.removeChild(this._canvas);
    }

    map.off('moveend', this._reset, this);

    if (map.options.zoomAnimation) {
      map.off('zoomanim', this._animateZoom, this);
    }
  }

  addTo (map) {
    map.addLayer(this);
    return this;
  }

  _initCanvas () {
    var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer');

    var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
    canvas.style[originProp] = '50% 50%';

    var size = this._map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
    L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

    this._heat = new AdvancedHeatMap({ canvas });
    this._updateOptions();
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
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    var size = this._map.getSize();

    // TODO:
    // if (this._heat._width !== size.x) {
    //   this._canvas.width = this._heat._width = size.x;
    // }
    // if (this._heat._height !== size.y) {
    //   this._canvas.height = this._heat._height = size.y;
    // }

    this._redraw();
  }

  _redraw () {
    if (!this._map) {
      return;
    }

    var data = [],
      // TODO: we shouldn't hardcode it
      // r = this._heat._r,
      r = 40,
      size = this._map.getSize(),
      bounds = new L.Bounds(
        L.point([-r, -r]),
        size.add([r, r])),

      max = this.options.max === undefined ? 1 : this.options.max,
      maxZoom = this.options.maxZoom === undefined ? this._map.getMaxZoom() : this.options.maxZoom,
      v = 1 / Math.pow(2, Math.max(0, Math.min(maxZoom - this._map.getZoom(), 12))),
      cellSize = r / 2,
      grid = [],
      panePos = this._map._getMapPanePos(),
      offsetX = panePos.x % cellSize,
      offsetY = panePos.y % cellSize,
      i, len, p, cell, x, y, j, len2, k;

    // console.time('process');
    for (i = 0, len = this._latlngs.length; i < len; i++) {
      p = this._map.latLngToContainerPoint(this._latlngs[i]);
      if (bounds.contains(p)) {
        x = Math.floor((p.x - offsetX) / cellSize) + 2;
        y = Math.floor((p.y - offsetY) / cellSize) + 2;

        var alt =
          this._latlngs[i].alt !== undefined ? this._latlngs[i].alt :
            this._latlngs[i][2] !== undefined ? +this._latlngs[i][2] : 1;
        k = alt * v;

        grid[y] = grid[y] || [];
        cell = grid[y][x];

        if (!cell) {
          grid[y][x] = [p.x, p.y, k];

        } else {
          cell[0] = (cell[0] * cell[2] + p.x * k) / (cell[2] + k); // x
          cell[1] = (cell[1] * cell[2] + p.y * k) / (cell[2] + k); // y
          cell[2] += k; // cumulated intensity value
        }
      }
    }

    for (i = 0, len = grid.length; i < len; i++) {
      if (grid[i]) {
        for (j = 0, len2 = grid[i].length; j < len2; j++) {
          cell = grid[i][j];
          if (cell) {
            data.push([
              Math.round(cell[0]),
              Math.round(cell[1]),
              Math.min(cell[2], max)
            ]);
          }
        }
      }
    }
    // console.timeEnd('process');

    // console.time('draw ' + data.length);
    // this._heat.data(data).draw(this.options.minOpacity);
    this._heat.removeAll();
    data.forEach(item => this._heat.add(item))

    console.time('render')
    this._heat.render().then(() => {
      console.timeEnd('render')
    })
    // console.timeEnd('draw ' + data.length);

    this._frame = null;
  }

  _animateZoom (e) {
    var scale = this._map.getZoomScale(e.zoom),
      offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

    if (L.DomUtil.setTransform) {
      L.DomUtil.setTransform(this._canvas, offset, scale);

    } else {
      this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
    }
  }
  /**/
}
