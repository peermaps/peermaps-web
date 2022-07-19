var html = require('choo/html')
var css = require('sheetify')

var storageStyle = css`
  :host {
    padding: 10px;
    padding-right: 15px;
    border-bottom: 1px solid #999;
  }
`

module.exports = function (state, emit) {
  var data = state.settings.getTabData('storage')
  if (!data || !Array.isArray(data.storages)) return

  var content = data.storages.map(function (item, index) {
    var zoom = item.zoom
    return html`<div class=${storageStyle}>
      <label for='url'>data url</label>
      <input type='url' name='url' value=${item.url || ''} placeholder='https://example.com' required style='margin-top: 10px; margin-bottom: 10px; width: 100%;' onchange=${(e) => emit('settings:storage:url:update', index, e.target.value)}>
      <label for='minzoom'>min zoom level (${zoom[0]})</label>
      <input type='range' name='minzoom' min='1' max='21' step='1' value=${zoom[0]} style='width: 100%;' onchange=${(e) => emit('settings:storage:minzoom:update', index, e.target.value)}>
      <label for='maxzoom'>max zoom level (${zoom[1]})</label>
      <input type='range' name='maxzoom' min='1' max='21' step='1' value=${zoom[1]} style='width: 100%;' onchange=${(e) => emit('settings:storage:maxzoom:update', index, e.target.value)}>
      <label for='active'>description</label>
      <textarea name='description' style='resize: none; height: 5em; width: 100%' onchange=${(e) => emit('settings:storage:description:update', index, e.target.value)}>${item.description}</textarea>
      <label for='active'>active</label>
      <input type='checkbox' name='active' style='margin-left: 10px; margin-bottom: 10px;' onchange=${(e) => emit('settings:storage:active:update', index)} ${item.active ? 'checked' : ''} value=${item.active ? true : false}>
      <a title='delete storage'><div style='cursor: pointer; font-size: 1.5em;' onclick=${() => emit('settings:storage:delete', index)}>🗑</div></a>
    </div>`
  })
  return html`<div>
    ${content}
    <a title='add storage'><div style='cursor: pointer; margin: 5px; padding: 2px; border: 1px solid #999; width: 14px; text-align: center;' onclick=${() => emit('settings:storage:add')}>+</div></a>
  </div>`
}
