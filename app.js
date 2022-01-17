var app = require('choo')()
var mixmapPeermaps = require('mixmap-peermaps')
var html = require('choo/html')
var eyros = require('eyros/2d')
var mixmap = require('mixmap')
var resl = require('resl')
var regl = require('regl')
var httpStorage = require('mixmap-peermaps/storage/http')

var Settings = require('./components/settings.js')
var nextTick = process.nextTick

app.use(function (state, emitter) {
  var settings = Settings({ emitter: emitter })
  settings.use(emitter)
  // TODO load settings here
  // settings.load(cb)
  state.settings = settings
})

app.use(function (state, emitter) {
  state.params = {
    data: fixURL('/ipfs/QmVCYUK51Miz4jEjJxCq3bA6dfq5FXD6s2EYp6LjHQhGmh'),
    bbox: [7.56,47.55,7.58,47.56],
    style: { url: 'style.png' }
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
  state.storage = httpStorage(state.params.data)
  emitter.on('map:zoom:add', function (x) {
    state.map.setZoom(state.map.getZoom()+x)
    state.map.draw()
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
        font-family: ubuntu, sans-serif;
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
        left: ${settings.show ? settings.width : 0}px;
        bottom: 0px;
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
      .buttons .toggle-settings {
        bottom: 1em;
      }
    </style>
    <div class="ui-overlay">
      ${settings.render(emit)}
      <div class="buttons left-buttons">
        <div><button class="arrow north" onclick=${panNorth}></button></div>
        <div><button class="arrow west" onclick=${panWest}></button></div>
        <div><button class="arrow east" onclick=${panEast}></button></div>
        <div><button class="arrow south" onclick=${panSouth}></button></div>
        <div><button style="top: 3em; left: 4.5em;" onclick=${zoomIn}>+</button></div>
        <div><button style="top: 6em; left: 4.5em;" onclick=${zoomOut}>-</button></div>
        <div><button class="toggle-settings" onclick=${toggleSettings}>${settings.show ? '<' : '>'}</button></div>
      </div>
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
