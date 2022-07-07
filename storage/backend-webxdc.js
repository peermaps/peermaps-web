var createHttpBackend = require('./http')

function createStorageBackend (state, url) {
  var protocol = typeof url === 'string' ? url.split('://')[0] : ''
  var debug = state.params.debug
  if (protocol.startsWith('ipfs')) {
    return createHttpBackend(url, { debug: state.params.debug })
  }
}

module.exports = createStorageBackend
