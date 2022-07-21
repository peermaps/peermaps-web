var i18n = require('../../../lib/i18n.js')

module.exports = function (state, emitter) {
  var locale = 'en-US'
  // var locale = 'sv-SE'
  state.settings.ui = {
    locale: function (key) {
      return i18n[locale][key] || i18n['en-US'][key] || 'n/a'
    }
  }
}
