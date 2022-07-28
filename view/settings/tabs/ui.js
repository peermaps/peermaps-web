var html = require('choo/html')
var css = require('sheetify')

var localeStyle = css`
  :host {
    padding: 10px;
    border-bottom: 1px solid #999;
  }
`

module.exports = function (state, emit) {
  var l = state.settings.ui.lookup
  var locale = state.settings.ui.locale
  var locales = state.settings.ui.locales
  return html`<div class=${localeStyle}>
    <label for='url'>${l('ui_tab_locale')}</label>
    <select name='locale' style='margin-top: 10px; margin-bottom: 10px; width: calc(100% - 1ex);' onchange=${(e) => emit('settings:ui:locale:update', e.target.value)}>
      ${locales.map(function (item) {
        var selected = item.value === locale
        return html`<option value=${item.value} selected=${selected}>${item.description}</option>`
      })}
    </select>
  </div>`
}
