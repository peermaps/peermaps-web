var i18n = require('../../../lib/i18n.js')

module.exports = function (state, emitter) {
  // TODO get locale value from db
  var locale = 'en-US'
  state.settings.ui = {
    get locale () {
      return locale
    },
    locales: [
      { value: 'en-US', description: 'english - american' },
      { value: 'sv-SE', description: 'svenska' },
    ],
    lookup: function (key) {
      return i18n[locale][key] || i18n['en-US'][key] || 'n/a'
    }
  }

  emitter.on('settings:ui:locale:update', function (value) {
    locale = value
    emitter.emit('settings:dirty')
  })
}
