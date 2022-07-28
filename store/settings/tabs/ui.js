var sub = require('subleveldown')
var i18n = require('../../../lib/i18n.js')
var config = require('../../../config.json')
var strings = i18n.strings
var locales = i18n.locales

module.exports = function (state, emitter) {
  var db = sub(state.settings.db, 'ui', { valueEncoding: 'json' })
  var locale = config.settings.ui.locale || 'en-US'

  state.settings.ui = {
    get locale () {
      return locale
    },
    locales,
    lookup: function (key) {
      return strings[locale][key] || strings['en-US'][key] || key
    }
  }

  emitter.on('settings:ui:locale:update', function (value) {
    db.put('locale', value, function (err) {
      if (!err) {
        locale = value
        emitter.emit('render')
      }
    })
  })

  db.get('locale', function (err, value) {
    if (!err) locale = value
  })
}
