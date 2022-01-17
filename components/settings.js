var html = require('choo/html')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()

  this.show = false
  this.width = 470
  this.padding = 15

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

Settings.prototype.render = function (emit) {
  if (!this.show) return

  return html`<div id="settings">
    <div class="settings-group">
      ${this.groups.map(function (group) { return group.render(emit) })}
    </div>
  </div>`
}

/**
 * Groups.
 */
function SettingsGroup (opts) {
  if (!(this instanceof SettingsGroup)) return new SettingsGroup(opts)
  this.expanded = true
  this.title = opts.title || 'Missing group title'
  this.renderContent = opts.renderContent
}

SettingsGroup.prototype.render = function (emit) {
  // TODO render expand/collapse buttons to the right of the title
  return html`<div class="settings-group">
    <div class="settings-group-title">${this.title}</div>
    <div class="settings-group-content">
      ${this.renderContent(emit)}
    </div>
  </div>`
}

function renderStorageContent (emit) {
  return html`<div>url content here</div>`
}

module.exports = Settings
