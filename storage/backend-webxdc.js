var createHttpBackend = require('./http')

function createStorageBackend (state, url) {
  // TODO using http backend directly for all urls, even though only ipfs
  // is supported over http (since webxdc client can't do http calls to
  // http urls on the outside)
  return createHttpBackend(url)
}

module.exports = createStorageBackend
