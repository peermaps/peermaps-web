var html = require('choo/html')
var css = require('sheetify')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()

  this.show = true
  this.width = 550

  // TODO configure transparency level used in the settings dialog?

  this.containerStyle = css`
    :host {
      z-index: inherit;
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      height: 100%;
    }
  `
  this.tabContainerStyle = css`
    :host {
      display: flex;
      justify-content: space-around;
      height: 25px;
    }
  `
  this.tabStyle = css`
    :host {
      text-align: center;
      width: 100%;
      cursor: pointer;
      padding: 5px;
    }
  `
  this.tabContentStyle = css`
    :host {
      background: rgba(0, 0, 0, 0.3);
      position: absolute;
      top: 25px;
      bottom: 40px;
      left: 0px;
      right: 0px;
      overflow-x: hidden;
      overflow-y: auto;
      border-left: 1px solid #999;
      border-right: 1px solid #999;
    }
  `
  this.buttonContainerStyle = css`
    :host {
      position: absolute;
      bottom: 0px;
      height: 40px;
      width: 100%;
      display: flex;
      justify-content: end;
      align-items: center;
      border-top: 1px solid #999;
    }
  `
  this.buttonStyle = css`
    :host {
      background: black;
      width: 50px;
      text-align: center;
      margin-right: 15px;
      margin-top: 0px;
      margin-bottom: 0px;
      padding: 5px;
      cursor: pointer;
      border: 1px solid #999;
    }
  `

  // TODO Move to function together with the first storage object below
  var backendStyle = css`
    :host {
      padding: 10px;
      padding-right: 15px;
      border-bottom: 1px solid #999;
    }
  `

  this.tabs = [
    // TODO move out to separate function with css styles
    {
      name: 'storage',
      description: 'Define data urls for map storage',
      use: function (emitter) {
        var self = this
        emitter.on('settings:storage:url:update', function (index, url) {
          self.data.backends[index].url = url
          emitter.emit('settings:dirty')
        })
        emitter.on('settings:storage:minzoom:update', function (index, min) {
          var backend = self.data.backends[index]
          backend.zoom.min = Math.min(Number(min), backend.zoom.max)
          emitter.emit('settings:dirty')
        })
        emitter.on('settings:storage:maxzoom:update', function (index, max) {
          var backend = self.data.backends[index]
          backend.zoom.max = Math.max(Number(max), backend.zoom.min)
          emitter.emit('settings:dirty')
        })
      },
      render: function (emit) {
        var backends = this.data.backends
        var content = backends.map(function (backend, index) {
          return html`<div class=${backendStyle}>
            <label for='url'>data url</label>
            <input type='url' name='url' value=${backend.url || ''} placeholder='https://example.com' required style='margin-top: 3px; margin-bottom: 10px; width: 100%;' onchange=${(e) => emit('settings:storage:url:update', index, e.target.value)}>
            <label for='minzoom'>min zoom level</label>
            <input type='range' name='minzoom' min='1' max='21' step='1' value=${backend.zoom.min} style='width: 100%;' onchange=${(e) => emit('settings:storage:minzoom:update', index, e.target.value)}>
            <label for='maxzoom'>max zoom level</label>
            <input type='range' name='maxzoom' min='1' max='21' step='1' value=${backend.zoom.max} style='width: 100%;' onchange=${(e) => emit('settings:storage:maxzoom:update', index, e.target.value)}>
          </div>`
        })
        return html`<div>${content}</div>`
      },
      dirty: false,
      data: {
        backends: [
          {
            url: 'https://ipfs.io/ipfs/QmVCYUK51Miz4jEjJxCq3bA6dfq5FXD6s2EYp6LjHQhGmh',
            zoom: { min: 1, max: 21 },
            active: false
          },
          {
            url: 'https://peermaps.linkping.io',
            zoom: { min: 5, max: 21 },
            active: false
          },
          {
            url: 'http://localhost:8000',
            zoom: { min: 11, max: 18 },
            active: true
          }
        ]
      }
    },
    {
      name: 'misc',
      description: 'Miscelleanous settings',
      use: function (emitter) {},
      render: function (emit) {
        return html`<div>In the misc tab</div>`
      },
      dirty: false,
      data: {}
    },
    {
      name: 'junk',
      description: 'Not used for anything',
      use: function (emitter) {},
      render: function (emit) {
        return html`<div>In the junk tab</div>`
      },
      dirty: false,
      data: {}
    }
  ]
  this.selected = this.tabs[0].name
}

Settings.prototype.use = function (emitter) {
  var self = this
  emitter.on('settings:toggle', function () {
    self.toggle()
    emitter.emit('render')
  })
  emitter.on('settings:dirty', function () {
    self.getSelectedTab().dirty = true
    emitter.emit('render')
  })
  emitter.on('settings:ontabclick', function (name) {
    if (self.selected !== name) {
      console.info('switching to tab (leave for debug purpose)', name)
      self.selected = name
      emitter.emit('render')
    }
  })
  emitter.on('settings:apply', function () {
    console.log('TODO act on settings:apply event')
  })
  emitter.on('settings:reset', function () {
    console.log('TODO act on settings:reset event')
  })
  self.tabs.forEach(function (tab) { tab.use(emitter) })
}

Settings.prototype.toggle = function () {
  this.show = !this.show
}

Settings.prototype.getSelectedTab = function () {
  var self = this
  return this.tabs.find(function (tab) { return tab.name === self.selected })
}

Settings.prototype.render = function (emit) {
  var self = this
  if (!self.show) return
  var cstyle = `width: ${self.width}px;`
  return html`<div class=${self.containerStyle} style=${cstyle}>
    ${self.renderTabs(emit)}
    ${self.renderTabContent(emit)}
    ${self.renderButtons(emit)}
  </div>`
}

Settings.prototype.renderTabs = function (emit) {
  var self = this
  var content = this.tabs.map(function (tab, i) {
    var selected = self.selected === tab.name
    var cstyle = selected ? `
      border-top: 1px solid #999;
      border-right: 1px solid #999;
      border-left: 1px solid #999;
      background: rgba(0, 0, 0, 0.3);
    ` : `
      border-bottom: 1px solid #999;
      color: #999;
    `
    var name = tab.name
    return html`<div class=${self.tabStyle} style=${cstyle} onclick=${() => emit('settings:ontabclick', name)}>${name}</div>`
  })
  return html`<div class=${this.tabContainerStyle}>${content}</div>`
}

Settings.prototype.renderTabContent = function (emit) {
  var tab = this.getSelectedTab()
  return html`<div class=${this.tabContentStyle}>${tab.render(emit)}</div>`
}

Settings.prototype.renderButtons = function (emit) {
  var tab = this.getSelectedTab()
  var cstyle = `
    color: #${tab.dirty ? 'FFF' : '999'};
    cursor: ${tab.dirty ? 'pointer' : 'default'};
  `
  function onApply () {
    if (tab.dirty) {
      emit('settings:apply')
    }
  }
  return html`<div class=${this.buttonContainerStyle}>
    <div class=${this.buttonStyle} onclick=${() => emit('settings:reset')}>reset</div>
    <div class=${this.buttonStyle} style=${cstyle} onclick=${() => onApply()}>apply</div>
  </div>`
}

module.exports = Settings
