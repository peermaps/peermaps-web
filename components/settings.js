var html = require('choo/html')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()

  this.show = false
  this.groups = [
    SettingsGroup(),
    SettingsGroup(),
    SettingsGroup(),
    SettingsGroup()
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

Settings.prototype.render = function () {
  if (!this.show) return
  return html`<div id="settings">
    ${this.groups.map(g => g.render())}
  </div>`
}

// TODO how can I make this as clean as possible? basically need to wrap some content
// with a div that has a title and that can expand/collapse, but the content of the
// group should be handled by a separate function, which can be render like

/**
 * Groups.
 */
function SettingsGroup () {
  if (!(this instanceof SettingsGroup)) return new SettingsGroup()
  this.expanded = true
}

SettingsGroup.prototype.render = function () {
  return html`<div class="settings-group">
    <div>a group title</div>
    <div>some group content here....</div>
  </div>`
}

module.exports = Settings
