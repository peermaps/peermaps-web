var html = require('choo/html')
var css = require('sheetify')

var storageStyle = css`
  :host {
    padding: 10px;
    padding-right: 15px;
    border-bottom: 1px solid #999;
  }
`

function deleteIcon () {
  return html`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 482.428 482.429">
  <path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098 c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117 h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828 C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879 C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096 c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266 c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979 V115.744z" />
  <path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07 c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z" />
  <path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07 c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z" />
  <path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07 c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"/>
</svg>`
}

module.exports = function (state, emit) {
  var data = state.settings.getTabData('storage')
  if (!Array.isArray(data.storages)) return

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
      <a title='delete storage'><div style='cursor: pointer;' onclick=${() => emit('settings:storage:delete', index)}>${deleteIcon()}</div></a>
    </div>`
  })
  return html`<div>
    ${content}
    <a title='add storage'><div style='cursor: pointer; margin: 5px; padding: 2px; border: 1px solid #999; width: 14px; text-align: center;' onclick=${() => emit('settings:storage:add')}>+</div></a>
  </div>`
}
