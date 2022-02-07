var path = require('path')
path.posix = path // work-around for https://github.com/andrewosh/mountable-hypertrie/pull/5

var Hyperdrive = require('hyperdrive')
var hyperswarm = require('hyperswarm-web')
var ram = require('random-access-memory')
var pump = require('pump')

var DEFAULT_SWARM_OPTS = {
  bootstrap: [ 'wss://swarm.cblgh.org' ]
}

module.exports = function (url, opts) {
  opts = opts || {}
  var debug = opts.debug || false
  var key = url.replace(/^hyper:[\/]*/,'')
  var drive = new Hyperdrive(opts.ram || ram, key)
  var isOpen = false
  var openQueue = []
  function open() {
    isOpen = true
    for (var i = 0; i < openQueue.length; i++) {
      openQueue[i]()
    }
    openQueue = null
  }
  var swarm = hyperswarm(opts.swarmOpts || DEFAULT_SWARM_OPTS)
  drive.once('ready', function () {
    swarm.join(drive.discoveryKey)
  })
  swarm.on('connection', function (socket, info) {
    var peer = info.peer
    console.log('replicate starting with peer', peer.host)
    pump(socket, drive.replicate(info.client), socket, function (err) {
      if (err) console.log('hyperdrive: pump ERROR', err.message)
    })
    if (debug) socket.on('data', function (data) {
      console.log('hyperdrive: data from peer', peer.host, data)
    })
    socket.on('error', function (err) {
      console.log('hyperdrive: stream ERROR for peer', peer.host, err.message)
    })
    if (!isOpen) open()
  })

  return {
    length: function f (name, cb) {
      if (!isOpen) {
        return openQueue.push(function () { f(name, cb) })
      }
      drive.stat(name, { wait: true }, function (err, stat) {
        if (debug) console.log('LENGTH',name,err&&err.message,stat)
        if (err) retry(function () { f(name, cb) })
        else cb(null, stat.size)
      })
    },
    read: function f (name, offset, length, cb) {
      if (!isOpen) {
        return openQueue.push(function () { f(name, offset, length, cb) })
      }
      drive.open(name, 'r', function g (err, fd) {
        if (debug) console.log('OPEN',name,err&&err.message,fd)
        if (err) return retry(function () { f(name, offset, length, cb) })
        var buf = Buffer.alloc(length)
        drive.read(fd, buf, 0, length, offset, function (err) {
          if (err) return retry(function () { g(null, fd) })
          if (debug) console.log('READ',name,err)
          cb(err, buf)
        })
      })
    },

    getRootUrl: function () { return url },
    setRootUrl: function () {},
    destroy: function (name, cb) {
      console.log('destroy',name)
      // todo
      if (typeof cb === 'function') cb()
    }
  }

  function retry(f) {
    setTimeout(f, 1000)
  }
}
