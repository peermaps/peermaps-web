var regl = require('regl')
var mixmap = require('mixmap')
var mixmapPeermaps = require('mixmap-peermaps')
var eyros = require('eyros/2d')
var createStorage = require('../storage')

module.exports = function (state, emitter) {
  state.mix = mixmap(regl, {
    extensions: [
      'oes_element_index_uint',
      'oes_texture_float',
      'ext_float_blend'
    ]
  })
  state.map = state.mix.create({
    viewbox: state.params.bbox,
    backgroundColor: [0.82, 0.85, 0.99, 1.0],
    pickfb: { colorFormat: 'rgba', colorType: 'float32' }
  })

  emitter.on('map:zoom:add', function (x) {
    emitter.emit('map:zoom:set', state.map.getZoom()+x)
  })
  emitter.on('map:zoom:set', function (x) {
    state.map.setZoom(x)
    state.map.draw()
  })
  emitter.on('map:pan:lat', function (dir) {
    var viewbox = state.map.viewbox.slice()
    var dy = viewbox[3] - viewbox[1]
    viewbox[1] += dir*dy
    viewbox[3] += dir*dy
    state.map.setViewbox(viewbox)
    state.map.draw()
  })
  emitter.on('map:pan:lon', function (dir) {
    var viewbox = state.map.viewbox.slice()
    var dx = viewbox[2] - viewbox[0]
    viewbox[0] += dir*dx
    viewbox[2] += dir*dx
    state.map.setViewbox(viewbox)
    state.map.draw()
  })
  emitter.on('map:center', function (lonlat) {
    var dx = 0.01
    var dy = 0.01
    state.map.setViewbox([
      lonlat[0]-dx, lonlat[1]-dy,
      lonlat[0]+dx, lonlat[1]+dy
    ])
    state.map.draw()
  })

  function onReady () {
    state.storage = createStorage(state, getStorageUrl())

    emitter.on('settings:updated', updateStorageBackend)
    emitter.on('map:zoom:set', updateStorageBackend)

    var style = new Image
    style.onload = function () {
      var pm = mixmapPeermaps({
        map: state.map,
        eyros,
        storage: state.storage,
        wasmSource: fetch('eyros2d.wasm'),
        style
      })
    }
    style.src = state.params.style.url
  }

  function getStorageUrl () {
    if (state.params.data) {
      return state.params.data
    } else {
      return state.settings.getStorageUrl(state.map.getZoom())
    }
  }

  function updateStorageBackend () {
    state.storage.updateBackend(state, getStorageUrl())
    state.map.draw()
  }

  if (state.params.data) {
    onReady()
  } else {
    emitter.on('settings:ready', onReady)
  }
}
