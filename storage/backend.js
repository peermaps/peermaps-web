var createHttpBackend = require('./http')
var createHyperdriveBackend = require('./hyperdrive')
var config = require('../config.json')

function createStorageBackend (state, url) {
  var protocol = typeof url === 'string' ? url.split('://')[0] : ''
  var debug = state.params.debug
  if (protocol.startsWith('http')) {
    return createHttpBackend(url, { debug })
  } else if (protocol === 'hyper') {
    return createHyperdriveBackend(url, {
      swarmOpts: config.swarmOpts,
      debug
    })
  }
}

module.exports = createStorageBackend
