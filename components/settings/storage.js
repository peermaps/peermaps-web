var html = require('choo/html')
var css = require('sheetify')

var backendStyle = css`
  :host {
    padding: 10px;
    padding-right: 15px;
    border-bottom: 1px solid #999;
    margin-bottom: 10px;
  }
`

function StorageTab () {
  return {
    name: 'storage',
    description: 'Define data urls and zoom levels for map storage',
    use: function (settings, emitter) {
      var self = this
      emitter.on('settings:storage:url:update', function (index, url) {
        var data = settings.getTabData('storage')
        var backend = data.backends[index]
        backend.url = url
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:minzoom:update', function (index, min) {
        var data = settings.getTabData('storage')
        var backend = data.backends[index]
        backend.zoom.min = Math.min(Number(min), backend.zoom.max)
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:maxzoom:update', function (index, max) {
        var data = settings.getTabData('storage')
        var backend = data.backends[index]
        backend.zoom.max = Math.max(Number(max), backend.zoom.min)
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:active:update', function (index) {
        var data = settings.getTabData('storage')
        var backend = data.backends[index]
        backend.active = !backend.active
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:delete', function (index) {
        var data = settings.getTabData('storage')
        data.backends.splice(index, 1)
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:add', function () {
        var data = settings.getTabData('storage')
        data.backends.push({ zoom: { min: 1, max: 21 }, active: false })
        emitter.emit('settings:dirty')
      })
    },
    render: function (data, emit) {
      if (!Array.isArray(data.backends)) return

      var content = data.backends.map(function (item, index) {
        var zoom = item.zoom
        return html`<div class=${backendStyle}>
          <div style='position: absolute; right: 10px; cursor: pointer; padding-left: 4px; padding-right: 4px; border: 1px solid #999' onclick=${() => emit('settings:storage:delete', index)}>X</div>
          <label for='url'>data url</label>
          <input type='url' name='url' value=${item.url || ''} placeholder='https://example.com' required style='margin-top: 10px; margin-bottom: 10px; width: 100%;' onchange=${(e) => emit('settings:storage:url:update', index, e.target.value)}>
          <label for='minzoom'>min zoom level (${zoom.min})</label>
          <input type='range' name='minzoom' min='1' max='21' step='1' value=${zoom.min} style='width: 100%;' onchange=${(e) => emit('settings:storage:minzoom:update', index, e.target.value)}>
          <label for='maxzoom'>max zoom level (${zoom.max})</label>
          <input type='range' name='maxzoom' min='1' max='21' step='1' value=${zoom.max} style='width: 100%;' onchange=${(e) => emit('settings:storage:maxzoom:update', index, e.target.value)}>
          <label for='active'>active</label>
          <input type='checkbox' name='active' style='margin-left: 10px;' onchange=${(e) => emit('settings:storage:active:update', index)} ${item.active ? 'checked' : ''} value=${item.active ? true : false}>
        </div>`
      })
      return html`<div>
        ${content}
        <div style='position: absolute; left: 10px; cursor: pointer; padding-left: 4px; padding-right: 4px; border: 1px solid #999' onclick=${() => emit('settings:storage:add')}>+</div>
      </div>`
    },
    defaultData: function () {
      return {
        backends: [
          {
            url: 'https://ipfs.io/ipfs/QmVCYUK51Miz4jEjJxCq3bA6dfq5FXD6s2EYp6LjHQhGmh',
            zoom: { min: 1, max: 21 },
            active: true
          },
          {
            url: 'https://peermaps.linkping.io',
            zoom: { min: 1, max: 21 },
            active: false
          },
          {
            url: 'http://localhost:8000',
            zoom: { min: 1, max: 21 },
            active: false
          }
        ]
      }
    }
  }
}

module.exports = StorageTab
