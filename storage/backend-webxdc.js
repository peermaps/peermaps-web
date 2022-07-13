var createHttpBackend = require('./http')

function createStorageBackend (state, url) {
  var protocol = typeof url === 'string' ? url.split('://')[0] : ''
  if (protocol.startsWith('ipfs')) {
    return createHttpBackend(url, { debug: state.parameters.debug })
  }
}

module.exports = createStorageBackend
