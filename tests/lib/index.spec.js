import { expect } from 'chai'

import { AdvancedHeatmapLayer } from '../../'

describe('heatmap', () => {
  it('should construct', () => {
    expect(new AdvancedHeatmapLayer()).to.be.not.undefined
  })
})
