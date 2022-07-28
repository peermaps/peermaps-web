var html = require('choo/html')
var css = require('sheetify')

var endpointStyle = css`
  :host {
    padding: 10px;
    border-bottom: 1px solid #999;
  }
`

module.exports = function (state, emit) {
  var endpoints = state.settings.storage.endpoints

  var l = state.settings.ui.lookup
  var content = endpoints.map(function (endpoint, index) {
    var zoom = endpoint.zoom

    function renderUpArrow () {
      if (index !== 0) {
        return html`<div title=${l('storage_tab_move_storage_up')} class='emoji-icon-large' style='cursor: pointer;' onclick=${() => emit('settings:storage:move-up', index)}>⬆</div>`
      } else {
        return html`<div class='emoji-icon-large' style='opacity: 50%; cursor: default;'>⬆</div>`
      }
    }

    function renderDownArrow () {
      if (index !== endpoints.length - 1) {
        return html`<div title=${l('storage_tab_move_storage_down')} class='emoji-icon-large' style='cursor: pointer;' onclick=${() => emit('settings:storage:move-down', index)}>⬇</div>`
      } else {
        return html`<div class='emoji-icon-large' style='opacity: 50%; cursor: default;'>⬇</div>`
      }
    }

    return html`<div class=${endpointStyle}>
      <label for='url'>${l('storage_tab_url')}</label>
      <input type='url' name='url' value=${endpoint.url || ''} placeholder='https://example.com' required style='margin-top: 10px; margin-bottom: 10px; width: calc(100% - 1ex);' onchange=${(e) => emit('settings:storage:url:update', index, e.target.value)}>
      <label for='minzoom'>${l('storage_tab_min_zoom')} (${zoom[0]})</label>
      <input type='range' name='minzoom' min='1' max='21' step='1' value=${zoom[0]} style='width: 100%;' onchange=${(e) => emit('settings:storage:minzoom:update', index, e.target.value)}>
      <label for='maxzoom'>${l('storage_tab_max_zoom')} (${zoom[1]})</label>
      <input type='range' name='maxzoom' min='1' max='21' step='1' value=${zoom[1]} style='width: 100%;' onchange=${(e) => emit('settings:storage:maxzoom:update', index, e.target.value)}>
      <label for='active'>${l('storage_tab_description')}</label>
      <textarea name='description' style='resize: none; height: 5em; width: calc(100% - 1ex);' onchange=${(e) => emit('settings:storage:description:update', index, e.target.value)}>${endpoint.description}</textarea>
      <label for='active'>${l('storage_tab_active')}</label>
      <input type='checkbox' name='active' style='margin-left: 10px; margin-bottom: 10px;' onchange=${(e) => emit('settings:storage:active:update', index)} ${endpoint.active ? 'checked' : ''} value=${endpoint.active ? true : false}>
      <div style='display: flex; justify-content: space-between;'>
        <div title=${l('storage_tab_delete_storage')} class='emoji-icon-large' style='cursor: pointer;' onclick=${() => emit('settings:storage:delete', index)}>🗑</div>
        <div style='display: flex;'>
          ${renderUpArrow()}
          ${renderDownArrow()}
        </div>
      </div>
    </div>`
  })
  return html`<div>
    <div style="position: absolute; top: 0px; bottom: 40px; left: 0px; right: 0px; overflow-x: hidden; overflow-y: auto;">
      ${content}
      <div title=${l('storage_tab_add_storage')} style='cursor: pointer; padding: 5px 0px; text-align: center; border-bottom: 1px solid #999' onclick=${() => emit('settings:storage:add')}>
        <div class='emoji-icon-large'>➕</div>
      </div>
    </div>
    ${renderButtons(state, emit)}
  </div>`
}

var buttonContainerStyle = css`
  :host {
    display: flex;
    align-items: center;
    position: absolute;
    height: 40px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    border-top: 1px solid #999;
  }
`

var buttonStyle = css`
  :host {
    background: black;
    text-align: center;
    min-width: 20px;
    width: 75px;
    margin-left: 5px;
    margin-top: 0px;
    margin-bottom: 0px;
    padding: 5px;
    cursor: pointer;
    border: 1px solid #999;
  }
`

function renderButtons (state, emit) {
  var storage = state.settings.storage
  var cstyle = function (active) {
    return `
      color: #${active ? 'FFF' : '999'};
      cursor: ${active ? 'pointer' : 'default'};
    `
  }

  function onReload () {
    if (storage.canReload) {
      emit('settings:storage:reload')
    }
  }

  function onSave () {
    if (storage.dirty) {
      emit('settings:storage:save')
    }
  }

  var l = state.settings.ui.lookup
  return html`<div class=${buttonContainerStyle}>
    <div class=${buttonStyle} onclick=${() => emit('settings:storage:reset')}>${l('storage_tab_reset')}</div>
    <div class=${buttonStyle} style=${cstyle(storage.canReload)} onclick=${() => onReload()}>${l('storage_tab_reload')}</div>
    <div class=${buttonStyle} style=${cstyle(storage.dirty)} onclick=${() => onSave()}>${l('storage_tab_save')}</div>
  </div>`
}
