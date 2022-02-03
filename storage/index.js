/**
 * Storage wrapper object for relaying operations to backend.
 */
module.exports = function (backend) {
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
  storageFn.getBackend = function () { return backend }
  storageFn.setBackend = function (_backend) { backend = _backend }
  storageFn.destroy = function (name, cb) { backend.destroy(name, cb) }
  return storageFn
}
