import { Layer } from 'leaflet'

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

}
