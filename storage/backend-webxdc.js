const cache = require('./map-cache')
const nextTick = process.nextTick

function createStorageBackend (state, url) {
  return {
    length: function f (name, cb) {
      var data = cache[name]
      if (data) {
        nextTick(cb, null, data.length)
      } else {
        nextTick(cb, new Error(`could not find tree file ${name}`))
      }
    },
    read: function f (name, offset, length, cb) {
      var data = cache[name]
      if (data) {
        if (offset === 0 && length === data.length) {
          nextTick(cb, null, data)
        } else {
          nextTick(cb, null, data.subarray(offset, offset+length))
        }
      } else {
        nextTick(cb, new Error(`could not find tree file ${name}`))
      }
    },
    getRootUrl: function () { return '' },
    setRootUrl: function (url) {},
    destroy: function (name, cb) { nextTick(cb) }
  }
}

module.exports = createStorageBackend
