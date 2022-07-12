var config = require('../config.json')

module.exports = function (state, emitter) {
  var params = {
    data: '',
    bbox: config.bbox,
    fonts: config.fonts,
    style: config.style,
    debug: false
  }
  var qparams = new URLSearchParams(window.location.hash.replace(/^#/,''))
  if (qparams.has('data')) {
    params.data = fixURL(qparams.get('data'))
  }
  if (qparams.has('bbox')) {
    params.bbox = qparams.get('bbox').split(/\s*,\s*/).map(parseFloat)
  } else if (Array.isArray(params.bbox)) {
    updateViewBox(params.bbox)
  }
  if (qparams.has('style')) {
    params.style.url = fixURL(qparams.get('style'))
  }
  if (qparams.has('debug')) {
    params.debug = qparams.get('debug')
    if (params.debug === '') params.debug = true
    if (params.debug === 'false') params.debug = false
    if (params.debug === '0') params.debug = false
  }
  if (qparams.has('font')) {
    params.fonts = { endpoints: qparams.getAll('font').map(fixURL) }
  }

  function updateViewBox (bbox) {
    qparams.set('bbox', bbox.toString())
    window.location.hash = qparams.toString()
  }
  emitter.on('map:viewbox:updated', updateViewBox)

  state.params = params
}

function fixURL (u) {
  if (/^\/?ipfs\//.test(u)) {
    u = 'https://ipfs.io/' + u.replace(/^\//,'')
  }
  return u
}
