var html = require('choo/html')

/**
 * Settings dialog.
 */
function Settings (opts) {
  if (!(this instanceof Settings)) return new Settings(opts)
  opts = opts || {}
  this.width = opts.width || '500px'
}

Settings.prototype.render = function () {
  // TODO use settings group data array with .map()
  return html`<div class="settings">
    <div>settings group 1</div>
    <div>settings group 2</div>
    <div>settings group 3</div>
  </div>`
}

module.exports = Settings
