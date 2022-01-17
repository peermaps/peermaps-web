var html = require('choo/html')
var css = require('sheetify')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()

  this.show = true
  this.width = 470

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
    SettingsGroup({
      title: 'storage',
      renderContent: renderStorageContent
    })
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

Settings.prototype.render = function (emit) {
  if (!this.show) return

  var cstyle = `width: ${this.width}px;`

  //return html`<div class=${this.style} style=${cstyle}>
    //${this.groups.map(function (group) { return group.render(emit) })}
  //</div>`
  return html`<div class=${this.style} style=${cstyle}>
  </div>`
}

/**
 * Groups.
 */
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

module.exports = Settings
