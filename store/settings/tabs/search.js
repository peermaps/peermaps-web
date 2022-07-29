var Writable = require('readable-stream/writable')
var pump = require('pump')
var sgs = require('sparse-geonames-search')
var config = require('../../../config.json')

module.exports = function (state, emitter) {
  var debug = state.parameters.debug
  var search = state.settings.search = {
    results: [],
    errors: [],
    query: '',
    stream: null,
    endpoint: state.settings.getSearchEndpoint(),
    geonames: sgs({
      read: function (name, cb) {
        var e = search.endpoint
        var u = /\/$/.test(e) ? e + name : e + '/' + name
        if (debug) console.log(`search request ${u}`)
        var retries = 0, retryLimit = config.settings.search.retryLimit || -1
        ;(function retry() {
          fetch(u).then(r => {
            if (r.ok) {
              r.arrayBuffer().then(r => {
                if (debug) console.log(`search response (${r.byteLength} bytes) ${u}`)
                cb(null, Buffer.from(r))
              }).catch(cb)
            } else {
              if (debug) console.log('search fetch response status', r.status)
              if (retryLimit === 0 || (retryLimit > 0 && retries === retryLimit)) {
                cb(new Error('search retry limit reached'))
              } else {
                retries++
                if (debug) console.log('search retry', retries, u)
                retry()
              }
            }
          }).catch(cb)
        })()
      }
    })
  }
  function addResult (r) {
    search.results.push(r)
    search.results.sort(function (lhs, rhs) {
      if (lhs.population < rhs.population) return 1
      else if (lhs.population > rhs.population) return -1
      else return 0
    })
    emitter.emit('render')
  }
  function clearResults () {
    search.results = []
    if (search.stream) search.stream.destroy()
    search.stream = null
    emitter.emit('render')
  }
  function addError (err) {
    search.errors.push(err)
    emitter.emit('render')
  }
  emitter.on('settings:search:clear', function () {
    search.query = ''
    search.errors = []
    search.results = []
    if (search.stream) search.stream.destroy()
    search.stream = null
    emitter.emit('render')
  })
  emitter.on('settings:search:query', function (q) {
    search.query = q
    clearResults()
    var stream = search.geonames.search(q)
    search.stream = stream
    pump(stream, Writable({
      objectMode: true,
      write: function (row, enc, next) {
        addResult(row)
        next()
      },
    }), finish)
    function finish (err) {
      if (err) addError(err)
      search.stream = null
      emitter.emit('render')
    }
  })
}
