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
  self.resize = null
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
      description: 'UI settings'
    },
    {
      name: 'storage',
      description: 'Define data urls and zoom levels for map storage'
    }
  ]

  self.selected = self.tabs[0].name

  emitter.on('settings:toggle', function () {
    self.toggle()
    emitter.emit('render')
  })
  emitter.on('settings:ontabclick', function (name) {
    if (self.selected !== name) {
      self.selected = name
      emitter.emit('render')
    }
  })

  emitter.on('settings:resize:start', function (clientX) {
    self.resize = { clientX, width: self.width }
  })
  emitter.on('settings:resize:move', function (clientX) {
    var dx = state.settings.resize.clientX - clientX
    self.width = state.settings.resize.width + dx
    emitter.emit('render')
  })
  emitter.on('settings:resize:end', function () {
    self.resize = null
  })
}

Settings.prototype.initTabs = function (state, emitter) {
  require('./tabs/search')(state, emitter)
  require('./tabs/favorites')(state, emitter)
  require('./tabs/ui')(state, emitter)
  require('./tabs/storage')(state, emitter)
}

Settings.prototype.getStorageEndpoint = function (zoom) {
  var fallback
  var endpoints = this.storage.endpoints

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

Settings.prototype.toggle = function () {
  this.show = !this.show
}

Settings.prototype.getSelectedTab = function () {
  var self = this
  return this.tabs.find(function (tab) { return tab.name === self.selected })
}
