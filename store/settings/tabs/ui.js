var i18n = require('../../../lib/i18n.js')
var strings = i18n.strings
var locales = i18n.locales

module.exports = function (state, emitter) {
  function locale () {
    var data = state.settings.getTabData('ui')
    return (data && data.locale) || 'en-US'
  }

  state.settings.ui = {
    get locale () {
      return locale()
    },
    locales,
    lookup: function (key) {
      return strings[locale()][key] || strings['en-US'][key] || 'n/a'
    }
  }

  emitter.on('settings:ui:locale:update', function (value) {
    var data = state.settings.getTabData('ui')
    data.locale = value
    emitter.emit('settings:dirty')
  })
}
