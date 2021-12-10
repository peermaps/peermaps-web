var app = require('choo')()
var mixmapPeermaps = require('mixmap-peermaps')
var nextTick = process.nextTick

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

var regl = require('regl')
var httpStorage = require('mixmap-peermaps/storage/http')
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
    var dx = viewbox[3] - viewbox[1]
    viewbox[1] += dir*dx
    viewbox[3] += dir*dx
    state.map.setViewbox(viewbox)
    state.map.draw()
  })
  emitter.on('map:pan:lon', function (dir) {
    var viewbox = state.map.viewbox.slice()
    var dy = viewbox[2] - viewbox[0]
    viewbox[0] += dir*dy
    viewbox[2] += dir*dy
    state.map.setViewbox(viewbox)
    state.map.draw()
  })
})

var eyros = require('eyros/2d')
var mixmap = require('mixmap')
var resl = require('resl')
 
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

var html = require('choo/html')
app.route('*', function (state, emit) {
  nextTick(function () {
    state.map.draw()
  })
  return html`<body>
    <style>
      body {
        margin: 0px;
        overflow: hidden;
      }
      .buttons {
        z-index: 2000;
      }
      .left-buttons {
        position: absolute;
        top: 0px;
        left: 0px;
        bottom: 0px;
        padding: 1em;
      }
      .buttons button {
        position: absolute;
        min-width: 4ex;
        height: 2em;
        font-family: monospace;
        margin-bottom: 2em;
        opacity: 30%;
        background-color: black;
        color: white;
        border: 0px;
        border-radius: 5px;
      }
      .buttons button:hover {
        opacity: 100%;
      }
    </style>
    <div class="buttons left-buttons">
      <div><button style="left: 5em;" onclick=${panNorth}>N</button></div>
      <div><button style="top: 4.5em;" onclick=${panWest}>W</button></div>
      <div><button style="top: 4.5em; left: 4em;" onclick=${zoomOut}>-</button></div>
      <div><button style="top: 4.5em; left: 6em;" onclick=${zoomIn}>+</button></div>
      <div><button style="top: 4.5em; left: 9em;" onclick=${panEast}>E</button></div>
      <div><button style="top: 8em; left: 5em;" onclick=${panSouth}>S</button></div>
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
})
app.mount(document.body)
