var config = require('../config.json')

module.exports = function (state, emitter) {
  state.params = {
    data: '',
    bbox: config.bbox,
    fonts: config.fonts,
    style: config.style,
    debug: false
  }
  var qparams = new URLSearchParams(window.location.hash.replace(/^#/,''))
  if (qparams.has('data')) {
    state.params.data = fixURL(qparams.get('data'))
  }
  if (qparams.has('bbox')) {
    state.params.bbox = qparams.get('bbox').split(/\s*,\s*/).map(parseFloat)
  }
  if (qparams.has('style')) {
    state.params.style.url = fixURL(qparams.get('style'))
  }
  if (qparams.has('debug')) {
    state.params.debug = qparams.get('debug')
    if (state.params.debug === '') state.params.debug = true
    if (state.params.debug === 'false') state.params.debug = false
    if (state.params.debug === '0') state.params.debug = false
  }
  if (qparams.has('font')) {
    state.params.fonts = { endpoints: qparams.getAll('font').map(fixURL) }
  }
}

function fixURL (u) {
  if (/^\/?ipfs\//.test(u)) {
    u = 'https://ipfs.io/' + u.replace(/^\//,'')
  }
  return u
}
