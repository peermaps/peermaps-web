var sub = require('subleveldown')
var config = require('../../config.json').settings

module.exports = function (state, emitter) {
  state.settings = new Settings(state, emitter)
  state.settings.initTabs(state, emitter)
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
  self.parameters = state.parameters

  self.tabs = [
    {
      name: 'search',
      description: 'Search POIs'
    },
    {
      name: 'favorites',
      description: 'Favorite POIs'
    },
    {
      name: 'ui',
      description: 'UI settings',
      defaultData: function () {
        return { locale: config.ui.locale }
      }
    },
    {
      name: 'storage',
      description: 'Define data urls and zoom levels for map storage',
      defaultData: function () {
        var endpoints = [ ...config.storage.endpoints ]
        return { endpoints }
      }
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
}

Settings.prototype.initTabs = function (state, emitter) {
  require('./tabs/search')(state, emitter)
  require('./tabs/favorites')(state, emitter)
  require('./tabs/ui')(state, emitter)
  require('./tabs/storage')(state, emitter)
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

Settings.prototype.getStorageEndpoint = function (zoom) {
  var fallback
  var endpoints = this.tabData.storage.endpoints

  for (var i = 0; i < endpoints.length; ++i) {
    var endpoint = endpoints[i]
    if (typeof endpoint.url === 'string' && endpoint.active) {
      if (!fallback) fallback = endpoint
      if (endpoint.zoom[0] <= zoom && endpoint.zoom[1] >= zoom) {
        return endpoint.url
      }
    }
  }

  if (fallback) {
    return fallback.url
  } else {
    console.warn('no matching map endpoint for zoom level', zoom)
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

Settings.prototype.getFontEndpoint = function () {
  var endpoints = (this.parameters.fonts || {}).endpoints || []
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
