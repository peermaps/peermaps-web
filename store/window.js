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

  if (state.window.hasTouch) {
    window.addEventListener('mousedown', function (ev) {
      var button = getOpacityButtonElement(ev.target)
      if (button) {
        button.style.opacity = '100%'
        setTimeout(function () { button.style.opacity = '30%' }, 200)
      }
    })
  }
}

/**
 * Check if a target or its parent is an opacity button in the ui overlay
 */
function getOpacityButtonElement (target) {
  var button
  if (target.nodeName === 'BUTTON') {
    button = target
  } else if (target.parentElement.nodeName === 'BUTTON') {
    button = target.parentElement
  }
  return button && button.classList.contains('opacity') && button
}
