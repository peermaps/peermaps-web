var sub = require('subleveldown')

module.exports = function (state, emitter) {
  var db = sub(state.settings.db, 'favorites', { valueEncoding: 'json' })
  var favorites = state.settings.favorites = []

  emitter.on('settings:favorites:add', function (r) {
    db.put(r.id, r, function (err) {
      if (err) {
        console.error('failed to add favorite')
      } else {
        favorites.push(r)
        emitter.emit('render')
      }
    })
  })

  emitter.on('settings:favorites:delete', function (r) {
    db.del(r.id, function (err) {
      if (err) {
        console.error('failed to delete favorite')
      } else {
        state.settings.favorites = favorites = favorites.filter(i => i.id !== r.id)
        emitter.emit('render')
      }
    })
  })

  db.createReadStream().on('data', data => favorites.push(data.value))
}
