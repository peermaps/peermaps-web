var html = require('choo/html')
var css = require('sheetify')
var StorageTab = require('./storage')

/**
 * Settings dialog.
 */
function Settings (opts) {
  var self = this
  if (!(self instanceof Settings)) return new Settings(opts)

  var emitter = self.emitter = opts.emitter
  self.db = opts.db
  self.show = true
  self.dirty = false
  self.width = 550

  // TODO configure transparency level used in the settings dialog?

  self.containerStyle = css`
    :host {
      z-index: inherit;
      position: absolute;
      background: rgba(0, 0, 0, 0.7);
      height: 100%;
    }
  `
  self.tabContainerStyle = css`
    :host {
      display: flex;
      justify-content: space-around;
      height: 25px;
    }
  `
  self.tabStyle = css`
    :host {
      text-align: center;
      width: 100%;
      cursor: pointer;
      padding: 5px;
    }
  `
  self.tabContentStyle = css`
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
  self.buttonContainerStyle = css`
    :host {
      position: absolute;
      bottom: 0px;
      height: 40px;
      left: 0px;
      right: 0px;
      display: flex;
      justify-content: end;
      align-items: center;
      border-top: 1px solid #999;
      padding-right: 10px;
    }
  `
  self.buttonStyle = css`
    :host {
      background: black;
      width: 50px;
      text-align: center;
      margin-left: 10px;
      margin-top: 0px;
      margin-bottom: 0px;
      padding: 5px;
      cursor: pointer;
      border: 1px solid #999;
    }
  `

  self.tabs = [
    StorageTab(),
    {
      name: 'misc',
      description: 'Miscelleanous settings',
      use: function (settings, emitter) {},
      render: function (data, emit) {
        return html`<div>In the misc tab</div>`
      }
    },
    {
      name: 'junk',
      description: 'Not used for anything',
      use: function (settings, emitter) {},
      render: function (data, emit) {
        return html`<div>In the junk tab</div>`
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
      console.info('switching to tab (leave for debug purpose)', name)
      self.selected = name
      emitter.emit('render')
    }
  })
  emitter.on('settings:reset', function () {
    console.log('TODO act on settings:reset event')
  })
  emitter.on('settings:reload', function () {
    console.log('TODO act on settings:reload event')
  })
  emitter.on('settings:apply', function () {
    console.log('TODO act on settings:apply event')
  })

  self.load()
  self.tabs.forEach(function (tab) { tab.use(self, emitter) })
}

/**
 * Loads json data for all tabs.
 */
Settings.prototype.load = function () {
  var self = this
  self.db.createReadStream()
    .on('data', function (data) {
      var key = data.key
      var value = data.value
      var tab = self.tabs.find(tab => tab.name === key)
      if (tab) self.tabData[tab.name] = value
    })
    .on('error', function (err) {
      console.error('error reading settings from level', err)
    })
    .on('end', function () {
      self.tabs.forEach(tab => {
        if (!self.tabData[tab.name]) {
          console.log(`no data stored for tab ${tab.name}, using default`)
          self.tabData[tab.name] = tab.DEFAULT_DATA || {}
        }
      })
      self.emitter.emit('render')
    })
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
  var data = this.getTabData(tab.name)
  if (data) {
    return html`<div class=${this.tabContentStyle}>${tab.render(data, emit)}</div>`
  }
}

Settings.prototype.renderButtons = function (emit) {
  var self =  this
  var cstyle = `
    color: #${self.dirty ? 'FFF' : '999'};
    cursor: ${self.dirty ? 'pointer' : 'default'};
  `
  function onApply () {
    if (self.dirty) {
      emit('settings:apply')
    }
  }
  return html`<div class=${this.buttonContainerStyle}>
    <div class=${this.buttonStyle} onclick=${() => emit('settings:reset')}>reset</div>
    <div class=${this.buttonStyle} onclick=${() => emit('settings:reload')}>reload</div>
    <div class=${this.buttonStyle} style=${cstyle} onclick=${() => onApply()}>apply</div>
  </div>`
}

module.exports = Settings
