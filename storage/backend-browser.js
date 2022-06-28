var idbStorage = require('random-access-idb')
var config = require('../config.json')
var createHttpBackend = require('./http')
var createHyperdriveBackend = require('./hyperdrive')

console.log('in browser backend')

function createIdbStorage (url) {
  try {
    return idbStorage(url)
  } catch (e) {
    console.error('random-access-idb failed', e)
  }
}

function createStorageBackend (state, url) {
  var protocol = typeof url === 'string' ? url.split('://')[0] : ''
  if (protocol.startsWith('http')) {
    console.info('creating http backend for url', url)
    return createHttpBackend(url, { debug: state.params.debug })
  } else if (protocol === 'hyper') {
    console.info('creating hyperdrive storage for url', url)
    return createHyperdriveBackend(url, {
      swarmOpts: config.swarmOpts,
      ram: createIdbStorage(url),
      debug: true
    })
  } else {
    console.warn('missing protocol handler for url', url)
  }
}

module.exports = createStorageBackend
