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
      overflow-y: auto;
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
    }
  `

  this.tabs = [
    {
      name: 'storage',
      description: 'Define data urls for map storage',
      dirty: false
    },
    {
      name: 'misc',
      description: 'Miscelleanous settings',
      dirty: false
    },
    {
      name: 'junk',
      description: 'Not used for anything',
      dirty: false
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

Settings.prototype.render = function (emit) {
  if (!this.show) return
  var cstyle = `width: ${this.width}px;`
  return html`<div class=${this.containerStyle} style=${cstyle}>
    ${this.renderTabs(emit)}
  </div>`
}

Settings.prototype.renderTabs = function (emit) {
  var self = this
  var content = this.tabs.map(function (tab, i) {
    var selected = self.selected === tab.name
    var cstyle = selected ? `border: 1px solid #FFF` : ''
    var name = tab.name
    return html`<div class=${self.tabStyle} style=${cstyle} onclick=${() => emit('settings:ontabclick', name)}>${name}</div>`
  })
  return html`<div class=${this.tabContainerStyle}>${content}</div>`
}

/**
 * Groups
 */
/*
function SettingsGroup (opts) {
  if (!(this instanceof SettingsGroup)) return new SettingsGroup(opts)

  this.title = opts.title || 'Missing group title'
  this.renderContent = opts.renderContent
  this.padding = 6

  this.expanded = true
  this.style = css`
    :host {
      margin-bottom: 10px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #999;
    }
  `
}

SettingsGroup.prototype.render = function (emit) {
  // TODO render expand/collapse buttons to the right of the title
  var titleStyle = `
    padding: ${this.padding}px;
    border-bottom: 1px solid #999;
  `
  var contentStyle = `padding: ${this.padding}px;`

  return html`<div class=${this.style}>
    <div style=${titleStyle}>${this.title}</div>
    <div style=${contentStyle}>
      ${this.renderContent(emit)}
    </div>
  </div>`
}

function renderStorageContent (emit) {
  return html`<div>url content here</div>`
}
*/

module.exports = Settings
