var html = require('choo/html')

/**
 * Settings dialog.
 */
function Settings () {
  if (!(this instanceof Settings)) return new Settings()
  this._groups = [
    DataUrlGroup(),
    DataUrlGroup(),
    DataUrlGroup(),
    DataUrlGroup()
  ]
}

Settings.prototype.render = function () {
  return html`<div id="settings">
    ${this._groups.map(g => g.render())}
  </div>`
}

/**
 * Groups.
 */
function DataUrlGroup () {
  if (!(this instanceof DataUrlGroup)) return new DataUrlGroup()
  this.expanded = true
}

DataUrlGroup.prototype.render = function () {
  return html`<div class="settings-group">
    <div>a group title</div>
    <div>some group content here....</div>
  </div>`
}

module.exports = Settings
