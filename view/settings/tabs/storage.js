var html = require('choo/html')
var css = require('sheetify')

var endpointStyle = css`
  :host {
    padding: 10px;
    padding-right: 15px;
    border-bottom: 1px solid #999;
  }
`

module.exports = function (state, emit) {
  var data = state.settings.getTabData('storage')
  if (!data || !Array.isArray(data.endpoints)) return

  var content = data.endpoints.map(function (endpoint, index) {
    var zoom = endpoint.zoom
    return html`<div class=${endpointStyle}>
      <label for='url'>data url</label>
      <input type='url' name='url' value=${endpoint.url || ''} placeholder='https://example.com' required style='margin-top: 10px; margin-bottom: 10px; width: 100%;' onchange=${(e) => emit('settings:storage:url:update', index, e.target.value)}>
      <label for='minzoom'>min zoom level (${zoom[0]})</label>
      <input type='range' name='minzoom' min='1' max='21' step='1' value=${zoom[0]} style='width: 100%;' onchange=${(e) => emit('settings:storage:minzoom:update', index, e.target.value)}>
      <label for='maxzoom'>max zoom level (${zoom[1]})</label>
      <input type='range' name='maxzoom' min='1' max='21' step='1' value=${zoom[1]} style='width: 100%;' onchange=${(e) => emit('settings:storage:maxzoom:update', index, e.target.value)}>
      <label for='active'>description</label>
      <textarea name='description' style='resize: none; height: 5em; width: 100%' onchange=${(e) => emit('settings:storage:description:update', index, e.target.value)}>${endpoint.description}</textarea>
      <label for='active'>active</label>
      <input type='checkbox' name='active' style='margin-left: 10px; margin-bottom: 10px;' onchange=${(e) => emit('settings:storage:active:update', index)} ${endpoint.active ? 'checked' : ''} value=${endpoint.active ? true : false}>
      <a title='delete storage'><div class="emoji-icon-large" style='cursor: pointer;' onclick=${() => emit('settings:storage:delete', index)}>🗑</div></a>
    </div>`
  })
  return html`<div>
    ${content}
    <a title='add storage'><div style='cursor: pointer; padding: 5px 0px; text-align: center; border-bottom: 1px solid #999' onclick=${() => emit('settings:storage:add')}><div class="emoji-icon-large">➕</div></div></a>
  </div>`
}
