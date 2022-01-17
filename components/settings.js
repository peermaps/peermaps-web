var html = require('choo/html')
var css = require('sheetify')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()

  this.show = false
  this.width = 470
  this.padding = 15

  this.style = css`
    :host {
      z-index: inherit;
      position: absolute;
      background: rgba(0, 0, 0, 0.5);
      height: 100%;
      overflow-y: auto;
    }
  `

  this.groups = [
    SettingsGroup({ title: 'Storage', renderContent: renderStorageContent }),
  ]
}

Settings.prototype.use = function (emitter) {
  var self = this
  emitter.on('settings:toggle', function () {
    self.toggle()
    emitter.emit('render')
  })
}

Settings.prototype.toggle = function () {
  this.show = !this.show
}

Settings.prototype.totalWidth = function () {
  return this.show ? this.width + 2 * this.padding : 0
}

Settings.prototype.render = function (state, emit) {
  if (!this.show) return

  var cstyle = `width: ${this.width}px; padding: ${this.padding}px;`

  return html`<div class=${this.style} style=${cstyle}>
    ${this.groups.map(function (group) { return group.render(state, emit) })}
  </div>`
}

/**
 * Groups.
 */
function SettingsGroup (opts) {
  if (!(this instanceof SettingsGroup)) return new SettingsGroup(opts)
  this.expanded = true
  this.title = opts.title || 'Missing group title'

  this.style = css`
    :host {
      color: white;
      margin-bottom: 10px;
      background: rgba(0, 0, 0, 0.5);
    }
  `

  this.renderContent = opts.renderContent
}

SettingsGroup.prototype.render = function (state, emit) {
  // TODO render expand/collapse buttons to the right of the title
  var padding = state.settings.padding
  var titleStyle = `
    padding-left: ${padding}px;
    padding-top: ${padding}px;
    padding-right: ${padding}px;
  `
  var contentStyle = `padding: ${padding}px;`

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

module.exports = Settings
