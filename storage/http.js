var rx = 0
var connectionLimit = 10
var level = require('level')

module.exports = function (url, opts) {
  if (!opts) opts = {}
  var debug = opts.debug
  var controllers = {}
  var callbacks = {} // store leaked callbacks here so they may be resumed later
  var active = {}
  var queue = []
  var pending = 0
  var db = level(url, { keyEncoding: 'string', valueEncoding: 'binary' })

  function wrappedGet (name, cb) {
    db.get(name, function (err, data) {
      if (!err) {
        cb(null, data)
      } else {
        getData(name, function (err, data) {
          if (err) return cb(err)
          db.put(name, data, function (err) {
            if (err) cb(err)
            else cb(null, data)
          })
        })
      }
    })
  }

  return {
    length: function f (name, cb) {
      wrappedGet(name, function (err, data) {
        cb(err, err ? null : data.length)
      })
    },
    read: function f (name, offset, length, cb) {
      wrappedGet(name, function (err, data) {
        if (err) {
          cb(err)
        } else if (offset === 0 && length === data.length) {
          cb(null, data)
        } else {
          cb(null, data.subarray(offset, offset+length))
        }
      })
    },
    destroy: function (name, cb) {
      if (debug) console.log('destroy',name)
      if (controllers[name]) {
        controllers[name].abort()
      }
      controllers[name] = null
      db.del(name, function (err) {
        for (var i = 0; i < queue.length; i++) {
          var q = queue[i]
          if (q.name === name) {
            leak(q.name, q.cb)
          }
        }
        queue = queue.filter(q => q.name !== name)
        if (cb) cb()
      })
    }
  }

  async function getData(name, cb) {
    if (active[name] || pending >= connectionLimit) {
      queue.push({ name, cb })
      return
    }
    pending++
    if (debug) console.log('get',name,pending,queue.length)
    active[name] = true
    var opts = {}
    if (typeof AbortController !== 'undefined') {
      controllers[name] = new AbortController
      opts.signal = controllers[name].signal
    }
    var to = setTimeout(function () {
      if (controllers[name]) controllers[name].abort()
      delete controllers[name]
    }, 10000)
    var delay = 10
    var data = null
    try {
      data = Buffer.from(await (await fetch(url + '/' + name, opts)).arrayBuffer())
      rx += data.length
    } catch (err) {
      if (controllers[name] === null) {
        if (debug) console.log('abort',name)
        leak(name, cb)
      } else {
        if (debug) console.error(name, err)
        queue.push({ name, cb })
        delay = 5000
      }
    }
    clearTimeout(to)
    delete active[name]
    delete controllers[name]
    if (data) {
      try { cb(null, data) }
      catch (err) { if (debug) console.error(err) }
      var found = false
      for (var i = 0; i < queue.length; i++) {
        if (queue[i].name === name) {
          try { queue[i].cb(null, data) }
          catch (err) { if (debug) console.error(err) }
          found = true
        }
      }
      if (found) queue = queue.filter(q => q.name !== name)
      var cbs = callbacks[name]
      if (Array.isArray(cbs)) {
        for (var i = 0; i < cbs.length; i++) {
          try { cbs[i](null, data) }
          catch (err) { if (debug) console.error(err) }
        }
        delete callbacks[name]
      }
      if (debug) console.log((rx/1024/1024).toFixed(1) + ' M')
    }
    pending--
    if (queue.length > 0 && pending < connectionLimit) {
      setTimeout(next, delay)
    }
  }

  function next() {
    if (queue.length > 0 && pending < connectionLimit) {
      var q = queue.shift()
      getData(q.name, q.cb)
    }
  }
  function leak(name, cb) {
    if (!callbacks[name]) callbacks[name] = [cb]
    else callbacks[name].push(cb)
  }
}
