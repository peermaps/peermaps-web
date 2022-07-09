var sub = require('subleveldown')
var config = require('../config.json').settings

module.exports = function (state, emitter) {
  state.settings = new Settings(state, emitter)
}

/**
 * Model for the settings dialog.
 */
function Settings (state, emitter) {
  var self = this

  self.db = sub(state.db, 'settings', { valueEncoding: 'json' }),

  self.show = false
  self.dirty = false
  self.canReload = false
  self.width = 550
  self.params = state.params

  self.tabs = [
    {
      name: 'storage',
      description: 'Define data urls and zoom levels for map storage',
      defaultData: function () {
        var storages = [ ...config.storage.storages ]
        return { storages }
      }
    },
    {
      name: 'misc',
      description: 'Miscelleanous settings'
    }
  ]
  self.tabData = {}

  self.selected = self.tabs[0].name

  emitter.on('settings:toggle', function () {
    self.toggle()
    emitter.emit('render')
  })
  emitter.on('settings:dirty', function () {
    self.dirty = true
    emitter.emit('render')
  })
  emitter.on('settings:ontabclick', function (name) {
    if (self.selected !== name) {
      self.selected = name
      emitter.emit('render')
    }
  })

  emitter.on('settings:reset', function () {
    self.reset(function (err) {
      if (err) {
        console.log('failed to reset settings data', err)
      } else {
        self.canReload = false
        self.dirty = false
        emitter.emit('settings:updated')
        emitter.emit('render')
      }
    })
  })
  emitter.on('settings:reload', function () {
    self.load(function (err) {
      if (!err) {
        self.dirty = false
        emitter.emit('settings:ready')
        emitter.emit('settings:updated')
        emitter.emit('render')
      }
    })
  })

  emitter.on('settings:apply', function () {
    self.save(function (err) {
      if (err) {
        console.log('failed to save settings data', err)
      } else {
        self.dirty = false
        self.canReload = true
        emitter.emit('settings:updated')
        emitter.emit('render')
      }
    })
  })

  self.load(function (err) {
    if (!err) {
      emitter.emit('settings:ready')
      emitter.emit('render')
    }
  })

  /**
   * Handlers for the storage tab
   */
  emitter.on('settings:storage:url:update', function (index, url) {
    var data = self.getTabData('storage')
    var storage = data.storages[index]
    storage.url = url
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:minzoom:update', function (index, min) {
    var data = self.getTabData('storage')
    var storage = data.storages[index]
    storage.zoom[0] = Math.min(Number(min), storage.zoom[1])
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:maxzoom:update', function (index, max) {
    var data = self.getTabData('storage')
    var storage = data.storages[index]
    storage.zoom[1] = Math.max(Number(max), storage.zoom[0])
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:description:update', function (index, description) {
    var data = self.getTabData('storage')
    var storage = data.storages[index]
    storage.description = description
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:active:update', function (index) {
    var data = self.getTabData('storage')
    var storage = data.storages[index]
    storage.active = !storage.active
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:delete', function (index) {
    var data = self.getTabData('storage')
    data.storages.splice(index, 1)
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:add', function () {
    var data = self.getTabData('storage')
    data.storages.push({ zoom: [1, 21], active: false })
    emitter.emit('settings:dirty')
  })
}

Settings.prototype.reset = function (cb) {
  var self = this
  var batch = self.tabs.map(function (tab) {
    return { type: 'del', key: tab.name }
  })
  self.tabData = {}
  self.db.batch(batch, function () {
    self.tabs.forEach(tab => self.setTabDefaults(tab))
    cb()
  })
}

Settings.prototype.setTabDefaults = function (tab) {
  if (typeof tab.defaultData === 'function') {
    this.tabData[tab.name] = tab.defaultData()
  } else {
    this.tabData[tab.name] = {}
  }
}

Settings.prototype.getStorageUrl = function (zoom) {
  var fallback
  var storages = this.tabData.storage.storages

  for (var i = 0; i < storages.length; ++i) {
    var storage = storages[i]
    if (typeof storage.url === 'string' && storage.active) {
      if (!fallback) fallback = storage
      if (storage.zoom[0] <= zoom && storage.zoom[1] >= zoom) {
        return storage.url
      }
    }
  }

  if (fallback) {
    return fallback.url
  } else {
    console.warn('no matching data url for zoom level', zoom)
  }
}

Settings.prototype.getSearchEndpoint = function () {
  var endpoints = (config.search || {}).endpoints || []
  var fallback
  for (var i = 0; i < endpoints.length; ++i) {
    var endpoint = endpoints[i]
    if (typeof endpoint.url === 'string' && endpoint.active) {
      if (!fallback) fallback = endpoint
    }
  }
  if (fallback) {
    return fallback.url
  } else {
    console.warn('no matching search endpoint')
  }
}

Settings.prototype.getFont = function () {
  var endpoints = (this.params.font || {}).endpoints || []
  var fallback
  for (var i = 0; i < endpoints.length; ++i) {
    var endpoint = endpoints[i]
    if (typeof endpoint.url === 'string' && endpoint.active) {
      if (!fallback) fallback = endpoint
    }
  }
  if (fallback) {
    return fallback.url
  } else {
    console.warn('no matching font endpoint')
  }
}

Settings.prototype.load = function (cb) {
  var self = this
  self.tabData = {}
  self.db.createReadStream()
    .on('data', function (data) {
      var key = data.key
      var value = data.value
      var tab = self.tabs.find(tab => tab.name === key)
      if (tab) {
        self.tabData[tab.name] = value
        self.canReload = true
      }
    })
    .on('error', function (err) {
      console.error('error reading settings from level', err)
      cb(err)
    })
    .on('end', function () {
      self.tabs.forEach(tab => {
        if (!self.tabData[tab.name]) {
          console.info(`setting default values for tab ${tab.name}`)
          self.setTabDefaults(tab)
        }
      })
      cb()
    })
}

Settings.prototype.save = function (cb) {
  var self = this
  var batch = self.tabs.map(function (tab) {
    var data = self.getTabData(tab.name)
    return { type: 'put', key: tab.name, value: data }
  })
  self.db.batch(batch, cb)
}

Settings.prototype.toggle = function () {
  this.show = !this.show
}

Settings.prototype.getTabData = function (name) {
  return this.tabData[name]
}

Settings.prototype.getSelectedTab = function () {
  var self = this
  return this.tabs.find(function (tab) { return tab.name === self.selected })
}
