module.exports = function (state, emitter) {
  emitter.on('settings:storage:url:update', function (index, url) {
    var data = state.settings.getTabData('storage')
    var endpoint = data.endpoints[index]
    endpoint.url = url
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:minzoom:update', function (index, min) {
    var data = state.settings.getTabData('storage')
    var endpoint = data.endpoints[index]
    endpoint.zoom[0] = Math.min(Number(min), endpoint.zoom[1])
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:maxzoom:update', function (index, max) {
    var data = state.settings.getTabData('storage')
    var endpoint = data.endpoints[index]
    endpoint.zoom[1] = Math.max(Number(max), endpoint.zoom[0])
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:description:update', function (index, description) {
    var data = state.settings.getTabData('storage')
    var endpoint = data.endpoints[index]
    endpoint.description = description
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:active:update', function (index) {
    var data = state.settings.getTabData('storage')
    var endpoint = data.endpoints[index]
    endpoint.active = !endpoint.active
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:delete', function (index) {
    var data = state.settings.getTabData('storage')
    data.endpoints.splice(index, 1)
    emitter.emit('settings:dirty')
  })
  emitter.on('settings:storage:add', function () {
    var data = state.settings.getTabData('storage')
    data.endpoints.push({ zoom: [1, 21], active: false })
    emitter.emit('settings:dirty')
  })
}
