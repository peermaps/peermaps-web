var Writable = require('readable-stream/writable')
var pump = require('pump')
var sgs = require('sparse-geonames-search')

module.exports = function (state, emitter) {
  state.search = {
    visible: false,
    results: [],
    errors: [],
    query: '',
    stream: null,
    endpoint: state.settings.getSearchEndpoint(),
    geonames: sgs({
      read: function (name, cb) {
        var e = state.search.endpoint
        var u = /\/$/.test(e) ? e + name : e + '/' + name
        if (state.params.debug) console.log(`search request ${u}`)
        fetch(u).then(r => r.arrayBuffer()).then(r => {
          if (state.params.debug) console.log(`search response (${r.byteLength} bytes) ${u}`)
          cb(null, Buffer.from(r))
        }).catch((err) => {
          if (state.params.debug) console.log('search fetch error', err)
          cb(err)
        })
      }
    })
  }
  emitter.on('search:toggle', function () {
    state.search.visible = !state.search.visible
    emitter.emit('render')
    if (state.search.visible) {
      setTimeout(() => {
        document.querySelector('.search form input[type=text]').focus()
      }, 50)
    }
  })
  emitter.on('search:result:push', function (r) {
    state.search.results.push(r)
    emitter.emit('render')
  })
  emitter.on('search:result:clear', function () {
    state.search.results = []
    if (state.search.stream) state.search.stream.destroy()
    state.search.stream = null
    emitter.emit('render')
  })
  emitter.on('search:error:push', function (err) {
    state.search.errors.push(err)
    emitter.emit('render')
  })
  emitter.on('search:error:clear', function () {
    state.search.errors = []
    emitter.emit('render')
  })
  emitter.on('search:clear', function () {
    state.search.query = ''
    state.search.errors = []
    state.search.results = []
    if (state.search.stream) state.search.stream.destroy()
    state.search.stream = null
    emitter.emit('render')
  })
  emitter.on('search:query', function (q) {
    state.search.query = q
    emitter.emit('search:result:clear')
    var stream = state.search.geonames.search(q)
    state.search.stream = stream
    pump(stream, Writable({
      objectMode: true,
      write: function (row, enc, next) {
        emitter.emit('search:result:push', row)
        next()
      },
    }), finish)
    function finish(err) {
      if (err) emitter.emit('search:error:push', err)
      state.search.stream = null
      emitter.emit('render')
    }
  })
}
