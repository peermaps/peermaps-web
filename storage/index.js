var createStorageBackend = require('./backend')

/**
 * Storage wrapper object for relaying operations to backend.
 */
module.exports = function (STATE, URL) {
  var backend = undefined
  var backendCache = {}

  // TODO add some clean up functionality in update for cached backends
  // that no longer should stay alive to clean up resources etc

  function createNewBackend (state, url) {
    var debug = state.params.debug
    backend = createStorageBackend(state, url)
    if (backend) {
      if (debug) console.log('storage: created new backend for url', url)
      backendCache[url] = backend
    } else {
      console.warn('storage: missing protocol handler for url', url)
    }
  }

  function updateBackend (state, url) {
    var debug = state.params.debug
    if (backend) {
      var cached = backendCache[url]
      if (cached && cached === backend) {
        if (debug) console.log('storage: not updating backend')
      } else if (cached) {
        if (debug) console.log('storage: updating to cached backend for url', url)
        backend = cached
      } else if (!cached) {
        createNewBackend(state, url)
      }
    } else {
      createNewBackend(state, url)
    }
  }

  // TODO use throw below on nyi methods

  var storageFn = function (name) {
    return {
      write: function (offset, buf, cb) {
        cb(new Error('write not implemented'))
      },
      truncate: function (length, cb) {
        cb(new Error('truncate not implemented'))
      },
      del: function (cb) {
        cb(new Error('del not implemented'))
      },
      sync: function (cb) {
        cb(new Error('sync not implemented'))
      },
      length: function (cb) {
        backend.length(name, cb)
      },
      read: function (offset, length, cb) {
        backend.read(name, offset, length, cb)
      }
    }
  }

  storageFn.destroy = function (name, cb) { backend.destroy(name, cb) }
  storageFn.updateBackend = function (state, url) { updateBackend(state, url) }

  updateBackend(STATE, URL)

  return storageFn
}
