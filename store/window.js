module.exports = function (state, emitter) {
  state.window = {
    hasTouch: 'ontouchstart' in document.documentElement
  }

  window.addEventListener('keydown', function (ev) {
    if (ev.code === 'Digit0') {
      emitter.emit('map:zoom:set', 6)
    } else if (ev.code === 'Minus') {
      emitter.emit('map:zoom:add', -1)
    } else if (ev.code === 'Equal') {
      emitter.emit('map:zoom:add', +1)
    }
  })

  state.window.width = window.innerWidth
  state.window.height = window.innerHeight
  window.addEventListener('resize', function (ev) {
    state.window.width = window.innerWidth
    state.window.height = window.innerHeight
    emitter.emit('render')
  })
}
