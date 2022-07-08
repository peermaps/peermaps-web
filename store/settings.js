var sub = require('subleveldown')
var config = require('../config.json')
var Settings = require('../components/settings')

module.exports = function (state, emitter) {
  var db = state.db
  state.settings = Settings({
    emitter: emitter,
    db: sub(db, 'settings', { valueEncoding: 'json' }),
    config: config.settings
  })
}
