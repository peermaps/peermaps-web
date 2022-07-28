var sub = require('subleveldown')
var config = require('../../../config.json')
var DEFAULT_ENDPOINTS = config.settings.storage.endpoints || []

module.exports = function (state, emitter) {
  var db = sub(state.settings.db, 'storage', { valueEncoding: 'json' })
  var endpoints = []

  state.settings.storage = {
    endpoints,
    canReload: false,
    dirty: false
  }

  emitter.on('settings:storage:url:update', function (index, url) {
    endpoints[index].url = url
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:minzoom:update', function (index, min) {
    var endpoint = endpoints[index]
    endpoint.zoom[0] = Math.min(Number(min), endpoint.zoom[1])
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:maxzoom:update', function (index, max) {
    var endpoint = endpoints[index]
    endpoint.zoom[1] = Math.max(Number(max), endpoint.zoom[0])
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:description:update', function (index, description) {
    var endpoint = endpoints[index]
    endpoint.description = description
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:active:update', function (index) {
    var endpoint = endpoints[index]
    endpoint.active = !endpoint.active
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:delete', function (index) {
    endpoints.splice(index, 1)
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:add', function () {
    endpoints.push({ zoom: [1, 21], active: false })
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:move-up', function (index) {
    var el = endpoints.splice(index, 1)
    endpoints.splice(index - 1, 0, el[0])
    emitter.emit('settings:storage:dirty')
  })
  emitter.on('settings:storage:move-down', function (index) {
    var el = endpoints.splice(index, 1)
    endpoints.splice(index + 1, 0, el[0])
    emitter.emit('settings:storage:dirty')
  })

  emitter.on('settings:storage:dirty', function () {
    state.settings.storage.dirty = true
    emitter.emit('render')
  })

  emitter.on('settings:storage:reset', function () {
    reset(function (err) {
      if (err) {
        console.log('failed to reset settings storage data', err)
      } else {
        state.settings.storage.canReload = false
        state.settings.storage.dirty = false
        emitter.emit('settings:storage:updated')
        emitter.emit('render')
      }
    })
  })

  emitter.on('settings:storage:reload', function () {
    load(function (err) {
      if (err) {
        console.log('failed to reload settings storage data', err)
      } else {
        state.settings.storage.dirty = false
        emitter.emit('settings:storage:updated')
        emitter.emit('render')
      }
    })
  })

  emitter.on('settings:storage:save', function () {
    save(function (err) {
      if (err) {
        console.log('failed to save settings storage data', err)
      } else {
        state.settings.storage.canReload = true
        state.settings.storage.dirty = false
        emitter.emit('settings:storage:updated')
        emitter.emit('render')
      }
    })
  })

  function reset (cb) {
    db.del('endpoints', function (err) {
      if (err) return cb(err)
      state.settings.storage.endpoints = endpoints = DEFAULT_ENDPOINTS.slice()
      cb()
    })
  }

  function load (cb) {
    db.get('endpoints', function (err, value) {
      if (err) {
        state.settings.storage.endpoints = endpoints = DEFAULT_ENDPOINTS.slice()
        cb(err)
      } else {
        state.settings.storage.endpoints = endpoints = value
        cb()
      }
    })
  }

  function save (cb) {
    db.put('endpoints', endpoints, cb)
  }

  load(function (err) {
    if (err && err.name !== 'NotFoundError') {
      console.log('failed to load storage settings', err)
    }
    emitter.emit('settings:storage:ready')
    emitter.emit('render')
  })
}
