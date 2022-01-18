var html = require('choo/html')
var css = require('sheetify')
var StorageTab = require('./storage')

/**
 * Settings dialog.
 */
function Settings (opts) {
  if (!(this instanceof Settings)) return new Settings(opts)

  this.db = opts.db
  this.show = true
  this.dirty = false
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
      left: 0px;
      right: 0px;
      display: flex;
      justify-content: end;
      align-items: center;
      border-top: 1px solid #999;
      padding-right: 10px;
    }
  `
  this.buttonStyle = css`
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

  this.tabs = [
    StorageTab(),
    {
      name: 'misc',
      description: 'Miscelleanous settings',
      use: function (emitter) {},
      render: function (emit) {
        return html`<div>In the misc tab</div>`
      },
      data: {}
    },
    {
      name: 'junk',
      description: 'Not used for anything',
      use: function (emitter) {},
      render: function (emit) {
        return html`<div>In the junk tab</div>`
      },
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
  self.tabs.forEach(function (tab) { tab.use(emitter) })
}

/**
 * Loads json data for all tabs.
 */
Settings.prototype.load = function (cb) {
  var self = this
  self.db.createReadStream({ gt: 'tabs', lt: 'tabs~' }).on('data', function (data) {
    var key = data.key
    var name = data.key.split(':')[1]
    var tab = self.tabs.find(function (tab) { return tab.name === name })
    if (tab) tab.data = data.value
  }).on('error', cb).on('end', function () { cb() })
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