var html = require('choo/html')
var css = require('sheetify')

var storageStyle = css`
  :host {
    padding: 10px;
    padding-right: 15px;
    border-bottom: 1px solid #999;
  }
`

function StorageTab (config) {
  return {
    name: 'storage',
    description: 'Define data urls and zoom levels for map storage',
    use: function (settings, emitter) {
      var self = this
      emitter.on('settings:storage:url:update', function (index, url) {
        var data = settings.getTabData('storage')
        var storage = data.storages[index]
        storage.url = url
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:minzoom:update', function (index, min) {
        var data = settings.getTabData('storage')
        var storage = data.storages[index]
        storage.zoom[0] = Math.min(Number(min), storage.zoom[1])
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:maxzoom:update', function (index, max) {
        var data = settings.getTabData('storage')
        var storage = data.storages[index]
        storage.zoom[1] = Math.max(Number(max), storage.zoom[0])
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:description:update', function (index, description) {
        var data = settings.getTabData('storage')
        var storage = data.storages[index]
        storage.description = description
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:active:update', function (index) {
        var data = settings.getTabData('storage')
        var storage = data.storages[index]
        storage.active = !storage.active
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:delete', function (index) {
        var data = settings.getTabData('storage')
        data.storages.splice(index, 1)
        emitter.emit('settings:dirty')
      })
      emitter.on('settings:storage:add', function () {
        var data = settings.getTabData('storage')
        data.storages.push({ zoom: [1, 21], active: false })
        emitter.emit('settings:dirty')
      })
    },
    render: function (data, emit) {
      if (!Array.isArray(data.storages)) return

      var content = data.storages.map(function (item, index) {
        var zoom = item.zoom
        return html`<div class=${storageStyle}>
          <div style='position: absolute; right: 10px; cursor: pointer; padding-left: 4px; padding-right: 4px; border: 1px solid #999' onclick=${() => emit('settings:storage:delete', index)}>X</div>
          <label for='url'>data url</label>
          <input type='url' name='url' value=${item.url || ''} placeholder='https://example.com' required style='margin-top: 10px; margin-bottom: 10px; width: 100%;' onchange=${(e) => emit('settings:storage:url:update', index, e.target.value)}>
          <label for='minzoom'>min zoom level (${zoom[0]})</label>
          <input type='range' name='minzoom' min='1' max='21' step='1' value=${zoom[0]} style='width: 100%;' onchange=${(e) => emit('settings:storage:minzoom:update', index, e.target.value)}>
          <label for='maxzoom'>max zoom level (${zoom[1]})</label>
          <input type='range' name='maxzoom' min='1' max='21' step='1' value=${zoom[1]} style='width: 100%;' onchange=${(e) => emit('settings:storage:maxzoom:update', index, e.target.value)}>
          <label for='active'>description</label>
          <textarea name='description' style='resize: none; height: 5em; width: 100%' onchange=${(e) => emit('settings:storage:description:update', index, e.target.value)}>${item.description}</textarea>
          <label for='active'>active</label>
          <input type='checkbox' name='active' style='margin-left: 10px;' onchange=${(e) => emit('settings:storage:active:update', index)} ${item.active ? 'checked' : ''} value=${item.active ? true : false}>
        </div>`
      })
      return html`<div>
        ${content}
        <div style='cursor: pointer; margin: 5px; padding: 2px; border: 1px solid #999; width: 14px; text-align: center;' onclick=${() => emit('settings:storage:add')}>+</div>
      </div>`
    },
    defaultData: function () {
      var storages = [ ...config.storages ]
      return { storages }
    }
  }
}

module.exports = StorageTab
