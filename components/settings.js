var html = require('choo/html')
var css = require('sheetify')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()

  this.show = true
  this.width = 470

  // TODO configure transparency level used in the settings dialog?

  this.containerStyle = css`
    :host {
      z-index: inherit;
      position: absolute;
      background: rgba(0, 0, 0, 0.8);
      height: 100%;
    }
  `
  this.tabContainerStyle = css`
    :host {
      display: flex;
      justify-content: space-around;
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
      height: 100%;
      padding: 10px;
      overflow-y: auto;
    }
  `
  this.buttonContainerStyle = css`
    :host {
      position: absolute;
      bottom: 0px;
      width: 100%;
      background: #444;
      display: flex;
      justify-content: end;
      align-items: center;
    }
  `
  this.buttonStyle = css`
    :host {
      background: rgba(0, 0, 0, 1.0);
      height: 20px;
      width: 50px;
      text-align: center;
      margin-right: 15px;
      margin-top: 7px;
      margin-bottom: 7px;
      padding: 5px;
      cursor: pointer;
    }
  `

  this.tabs = [
    {
      name: 'storage',
      description: 'Define data urls for map storage',
      render: function (emit) {
        return html`<div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
          <div>In the storage tab</div>
        </div>`
      },
      dirty: false,
      data: {}
    },
    {
      name: 'misc',
      description: 'Miscelleanous settings',
      render: function (emit) {
        return html`<div>In the misc tab</div>`
      },
      dirty: false,
      data: {}
    },
    {
      name: 'junk',
      description: 'Not used for anything',
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
  emitter.on('settings:ontabclick', function (name) {
    if (self.selected !== name) {
      console.info('switching to tab (leave for debug purpose)', name)
      self.selected = name
      emitter.emit('render')
    }
  })
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
      border-top: 1px solid #FFF;
      border-right: 1px solid #FFF;
      border-left: 1px solid #FFF;
      background: rgba(0, 0, 0, 0.3);
    ` : `
      border-bottom: 1px solid #FFF;
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
  return html`<div class=${this.buttonContainerStyle}>
    <div class=${this.buttonStyle}>apply</div>
    <div class=${this.buttonStyle}>reset</div>
  </div>`
}

module.exports = Settings
