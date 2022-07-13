var config = require('../config.json')

module.exports = function (state, emitter) {
  var parameters = {
    data: '',
    bbox: config.bbox,
    fonts: config.fonts,
    style: config.style,
    debug: false
  }
  var qparams = new URLSearchParams(window.location.hash.replace(/^#/,''))
  var timeout = null
  if (qparams.has('data')) {
    parameters.data = fixURL(qparams.get('data'))
  }
  if (qparams.has('bbox')) {
    parameters.bbox = qparams.get('bbox').split(/\s*,\s*/).map(parseFloat)
  } else if (Array.isArray(parameters.bbox)) {
    updateViewboxParams(parameters.bbox)
  }
  if (qparams.has('style')) {
    parameters.style.url = fixURL(qparams.get('style'))
  }
  if (qparams.has('debug')) {
    parameters.debug = qparams.get('debug')
    if (parameters.debug === '') parameters.debug = true
    if (parameters.debug === 'false') parameters.debug = false
    if (parameters.debug === '0') parameters.debug = false
  }
  if (qparams.has('font')) {
    parameters.fonts = { endpoints: qparams.getAll('font').map(fixURL) }
  }

  function updateViewboxParams (bbox) {
    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null
        qparams.set('bbox', bbox)
        window.location.hash = qparams.toString()
      }, 500)
    }
  }
  emitter.on('map:viewbox:updated', updateViewboxParams)

  state.parameters = parameters
}

function fixURL (u) {
  if (/^\/?ipfs\//.test(u)) {
    u = 'https://ipfs.io/' + u.replace(/^\//,'')
  }
  return u
}
