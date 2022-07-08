module.exports = function (state, emitter) {
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
}
