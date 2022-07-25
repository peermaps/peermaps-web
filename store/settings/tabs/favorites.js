var sub = require('subleveldown')

const TEST_DATA = [
  {
    "id": 2988507,
    "name": "Paris",
    "longitude": 2.34879994392395,
    "latitude": 48.85340881347656,
    "countryCode": "FR",
    "cc2": "",
    "admin1": "11",
    "admin2": "75",
    "admin3": "",
    "admin4": "",
    "population": 2138551,
    "elevation": 0
  },
  {
    "id": 8504417,
    "name": "La Defense",
    "longitude": 2.2388100624084473,
    "latitude": 48.8919792175293,
    "countryCode": "FR",
    "cc2": "",
    "admin1": "11",
    "admin2": "92",
    "admin3": "922",
    "admin4": "92062",
    "population": 20000,
    "elevation": 0
  },
  {
    "id": 4303602,
    "name": "Paris",
    "longitude": -84.25299072265625,
    "latitude": 38.209800720214844,
    "countryCode": "US",
    "cc2": "",
    "admin1": "KY",
    "admin2": "017",
    "admin3": "",
    "admin4": "",
    "population": 9870,
    "elevation": 257
  },
  {
    "id": 4246659,
    "name": "Paris",
    "longitude": -87.69613647460938,
    "latitude": 39.611148834228516,
    "countryCode": "US",
    "cc2": "",
    "admin1": "IL",
    "admin2": "045",
    "admin3": "57641",
    "admin4": "",
    "population": 8432,
    "elevation": 220
  }
]

module.exports = function (state, emitter) {
  var db = sub(state.settings.db, 'favorites', { valueEncoding: 'json' })
  var favorites = state.settings.favorites = {
    data: []
  }

  emitter.on('settings:favorites:add', function (r) {
    db.put(r.id, r, function (err) {
      if (err) {
        console.error('failed to add favorite')
      } else {
        favorites.data.push(r)
        emitter.emit('render')
      }
    })
  })

  emitter.on('settings:favorites:delete', function (r) {
    db.del(r.id, function (err) {
      if (err) {
        console.error('failed to delete favorite')
      } else {
        favorites.data = favorites.data.filter(i => i.id !== r.id)
        emitter.emit('render')
      }
    })
  })

  db.createReadStream()
    .on('data', function (data) {
      favorites.data.push(data.value)
    })
    .on('end', function () {
      if (favorites.data.length === 0) {
        favorites.data = TEST_DATA.slice()
        var batch = TEST_DATA.map(function (f) {
          return { type: 'put', key: f.id, value: f }
        })
        db.batch(batch, function (err) {
          if (err) console.log('batch err', err)
          else console.log('added test data')
        })
      }
    })
}
