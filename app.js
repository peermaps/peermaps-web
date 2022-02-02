var app = require('choo')()
var mixmapPeermaps = require('mixmap-peermaps')
var html = require('choo/html')
var eyros = require('eyros/2d')
var mixmap = require('mixmap')
var resl = require('resl')
var regl = require('regl')

var createStorage = require('./storage')
var createHttpBackend = require('./storage/http')
var createHyperdriveBackend = require('./storage/hyperdrive')

var level = require('level')
var sub = require('subleveldown')
var db = level('peermaps-web')

var config = require('./config.json')
var Settings = require('./components/settings')
var nextTick = process.nextTick

app.use(function (state, emitter) {
  var settings = Settings({
    emitter: emitter,
    db: sub(db, 'settings', { valueEncoding: 'json' }),
    config: config.settings
  })
  state.settings = settings
})

app.use(function (state, emitter) {
  state.params = {
    data: '',
    bbox: config.bbox,
    style: config.style
  }
  var qparams = new URLSearchParams(location.hash.replace(/^#/,''))
  if (qparams.has('data')) {
    state.params.data = fixURL(qparams.get('data'))
  }
  if (qparams.has('bbox')) {
    state.params.bbox = qparams.get('bbox').split(/\s*,\s*/).map(parseFloat)
  }
  if (qparams.has('style')) {
    state.params.style.url = fixURL(qparams.get('style'))
  }
})

function fixURL(u) {
  if (/^\/?ipfs\//.test(u)) {
    u = 'https://ipfs.io/' + u.replace(/^\//,'')
  }
  return u
}

app.use(function (state, emitter) {
  state.mix = mixmap(regl, {
    extensions: [ 'oes_element_index_uint', 'oes_texture_float', 'ext_float_blend' ]
  })
  state.map = state.mix.create({
    viewbox: state.params.bbox,
    backgroundColor: [0.82, 0.85, 0.99, 1.0],
    pickfb: { colorFormat: 'rgba', colorType: 'float32' }
  })

  emitter.on('map:zoom:add', function (x) {
    emitter.emit('map:zoom:set', state.map.getZoom()+x)
  })
  emitter.on('map:zoom:set', function (x) {
    state.map.setZoom(x)
    state.map.draw()
  })
  emitter.on('map:pan:lat', function (dir) {
    var viewbox = state.map.viewbox.slice()
    var dy = viewbox[3] - viewbox[1]
    viewbox[1] += dir*dy
    viewbox[3] += dir*dy
    state.map.setViewbox(viewbox)
    state.map.draw()
  })
  emitter.on('map:pan:lon', function (dir) {
    var viewbox = state.map.viewbox.slice()
    var dx = viewbox[2] - viewbox[0]
    viewbox[0] += dir*dx
    viewbox[2] += dir*dx
    state.map.setViewbox(viewbox)
    state.map.draw()
  })
})

app.use(function (state, emitter) {
  if (state.params.data) {
    onReady()
  } else {
    emitter.on('settings:ready', onReady)
  }

  function getStorageUrl () {
    if (state.params.data) {
      return state.params.data
    } else {
      return state.settings.getStorageUrl(state.map.getZoom())
    }
  }

  function createStorageBackend (url) {
    var protocol = typeof url === 'string' ? url.split('://')[0] : ''
    if (protocol.startsWith('http')) {
      console.info('creating http backend for url', url)
      return createHttpBackend(url)
    } else if (protocol.startsWith('hyper')) {
      console.info('creating hyperdrive storage for url', url)
      return createHyperdriveBackend(url, { debug: true })
    } else {
      console.warn('missing protocol handler for url', url)
    }
  }

  function updateStorageBackend () {
    var currentUrl = state.storage.getBackend().getRootUrl()
    var url = getStorageUrl()
    if (url && url !== currentUrl) {
      console.info('now using storage url', url)
      state.storage.setBackend(createStorageBackend(url))
      state.map.draw()
    }
  }

  function onReady () {
    var backend = createStorageBackend(getStorageUrl())
    state.storage = createStorage(backend)

    emitter.on('settings:updated', updateStorageBackend)
    emitter.on('map:zoom:set', updateStorageBackend)

    var style = new Image
    style.onload = function () {
      var pm = mixmapPeermaps({
        map: state.map,
        eyros,
        storage: state.storage,
        wasmSource: fetch('eyros2d.wasm'),
        style
      })
    }
    style.src = state.params.style.url
    window.addEventListener('click', function (ev) {
      /*
        pm.pick({ x: ev.offsetX, y: ev.offsetY }, function (err, data) {
        console.log('pick', err, data)
        })
      */
    })
  }
})

app.use(function (state, emitter) {
  window.addEventListener('keydown', function (ev) {
    if (ev.code === 'Digit0') {
      emitter.emit('map:zoom:set', 6)
    } else if (ev.code === 'Minus') {
      emitter.emit('map:zoom:add', -1)
    } else if (ev.code === 'Equal') {
      emitter.emit('map:zoom:add', +1)
    }
  })
  state.width = window.innerWidth
  state.height = window.innerHeight
  window.addEventListener('resize', function (ev) {
    state.width = window.innerWidth
    state.height = window.innerHeight
    emitter.emit('render')
  })
})

app.route('*', function (state, emit) {
  nextTick(function () {
    state.map.draw()
  })
  var settings = state.settings
  return html`<body>
    <style>
      body {
        margin: 0px;
        overflow: hidden;
        font-family: monospace;
        color: white;
      }
      .ui-overlay {
        z-index: 2000;
      }

      .buttons {
        z-index: inherit;
      }
      .left-buttons {
        position: absolute;
        top: 0px;
        bottom: 0px;
        padding: 1em;
      }
      .right-buttons {
        position: absolute;
        top: 0px;
        bottom: 0px;
        right: ${settings.show ? settings.width + 20 : 20}px;
        padding: 1em;
      }
      .buttons button {
        position: absolute;
        height: 2em;
        width: 2em;
        font-family: monospace;
        opacity: 30%;
        background-color: black;
        color: white;
        border: 0px;
        border-radius: 20px;
        padding: 0px;
      }
      .buttons .arrow {
        height: 3em;
        width: 3em;
        background: transparent;
        border-top: 5px solid black;
        border-right: 5px solid black;
        border-radius: 0px;
      }
      .buttons .north {
        transform: rotate(315deg);
        left: 4em;
      }
      .buttons .west {
        transform: rotate(225deg);
        top: 4em;
      }
      .buttons .east {
        transform: rotate(45deg);
        top: 4em;
        left: 6.5em;
      }
      .buttons .south {
        transform: rotate(135deg);
        top: 6.5em;
        left: 4em;
      }
      .buttons button:hover {
        opacity: 100%;
      }
    </style>
    <div class="ui-overlay">
      <div class="buttons left-buttons">
        <div><button class="arrow north" onclick=${panNorth}></button></div>
        <div><button class="arrow west" onclick=${panWest}></button></div>
        <div><button class="arrow east" onclick=${panEast}></button></div>
        <div><button class="arrow south" onclick=${panSouth}></button></div>
        <div><button style="top: 3em; left: 4.5em;" onclick=${zoomIn}>+</button></div>
        <div><button style="top: 6em; left: 4.5em;" onclick=${zoomOut}>-</button></div>
      </div>
      <div class="buttons right-buttons">
        <div><button class="toggle-settings" onclick=${toggleSettings}>${settings.show ? '>' : '<'}</button></div>
      </div>
      ${settings.render(emit)}
    </div>
    ${state.mix.render()}
    ${state.map.render({ width: state.width, height: state.height })}
  </body>`


  function zoomIn() { emit('map:zoom:add',+1) }
  function zoomOut() { emit('map:zoom:add',-1) }
  function panNorth() { emit('map:pan:lat',+1) }
  function panSouth() { emit('map:pan:lat',-1) }
  function panEast() { emit('map:pan:lon',+1) }
  function panWest() { emit('map:pan:lon',-1) }
  function toggleSettings() { emit('settings:toggle') }
})
app.mount(document.body)
