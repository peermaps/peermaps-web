var idbStorage = require('random-access-idb')
var config = require('../config.json')
var createHttpBackend = require('./http')
var createHyperdriveBackend = require('./hyperdrive')

function createIdbStorage (url) {
  try {
    return idbStorage(url)
  } catch (e) {
    console.error('random-access-idb failed', e)
  }
}

function createStorageBackend (state, url) {
  var protocol = typeof url === 'string' ? url.split('://')[0] : ''
  var debug = state.params.debug
  if (protocol.startsWith('http')) {
    return createHttpBackend(url, { debug })
  } else if (protocol === 'hyper') {
    return createHyperdriveBackend(url, {
      swarmOpts: config.swarmOpts,
      ram: createIdbStorage(url),
      debug
    })
  }
}

module.exports = createStorageBackend
