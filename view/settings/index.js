var html = require('choo/html')
var css = require('sheetify')
var tabViews = {
  search: require('./tabs/search'),
  storage: require('./tabs/storage'),
  misc: require('./tabs/misc')
}

var containerStyle = css`
  :host {
    z-index: inherit;
    position: absolute;
    right: 0px;
    background: rgba(0, 0, 0, 0.7);
    height: 100%;
    max-width: 100%;
  }
`

module.exports = function (state, emit) {
  var settings = state.settings
  if (!settings.show) return
  var cstyle = `width: ${settings.width}px;`
  return html`<div class=${containerStyle} style=${cstyle}>
    ${renderTabs(state, emit)}
    ${renderTabContent(state, emit)}
    ${renderButtons(state, emit)}
  </div>`
}

var tabContainerStyle = css`
  :host {
    display: flex;
    justify-content: space-around;
    height: 25px;
  }
`

var tabStyle = css`
  :host {
    text-align: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
  }
`

function renderTabs (state, emit) {
  var settings = state.settings
  var content = settings.tabs.map(function (tab, i) {
    var selected = settings.selected === tab.name
    var cstyle = selected ? `
      border-top: 1px solid #999;
      border-right: 1px solid #999;
      border-left: 1px solid #999;
      background: rgba(0, 0, 0, 0.3);
    ` : `
      border-bottom: 1px solid #999;
      color: #999;
    `
    var name = tab.name
    return html`<div class=${tabStyle} style=${cstyle} onclick=${() => emit('settings:ontabclick', name)}>${name}</div>`
  })
  return html`<div class=${tabContainerStyle}>${content}</div>`
}

var tabContentStyle = css`
  :host {
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 25px;
    bottom: 40px;
    left: 0px;
    right: 0px;
    overflow-x: hidden;
    overflow-y: auto;
    border-left: 1px solid #999;
    border-right: 1px solid #999;
  }
`

function renderTabContent (state, emit) {
  var tab = state.settings.getSelectedTab()
  var tabView = tabViews[tab.name]
  if (typeof tabView === 'function') {
    return html`<div class=${tabContentStyle}>${tabView(state, emit)}</div>`
  }
}

var buttonContainerStyle = css`
  :host {
    position: absolute;
    bottom: 0px;
    height: 40px;
    left: 0px;
    right: 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #999;
    padding-right: 10px;
    display: flex;
  }
`

var buttonStyle = css`
  :host {
    background: black;
    text-align: center;
    min-width: 20px;
    width: 50px;
    margin-left: 5px;
    margin-top: 0px;
    margin-bottom: 0px;
    padding: 5px;
    cursor: pointer;
    border: 1px solid #999;
  }
`

function renderButtons (state, emit) {
  var settings = state.settings
  var cstyle = function (active) {
    return `
      color: #${active ? 'FFF' : '999'};
      cursor: ${active ? 'pointer' : 'default'};
    `
  }

  function onReload () {
    if (settings.canReload) {
      emit('settings:reload')
    }
  }

  function onApply () {
    if (settings.dirty) {
      emit('settings:apply')
    }
  }

  return html`<div class=${buttonContainerStyle}>
    <a title="hide settings"><div class=${buttonStyle} style='max-width: 20px;' onclick=${() => emit('settings:toggle')}><div class="emoji-icon-small">❌</div></div></a>
    <div style='display: flex;'>
      <div class=${buttonStyle} onclick=${() => emit('settings:reset')}>reset</div>
      <div class=${buttonStyle} style=${cstyle(settings.canReload)} onclick=${() => onReload()}>reload</div>
      <div class=${buttonStyle} style=${cstyle(settings.dirty)} onclick=${() => onApply()}>apply</div>
    </div>
  </div>`
}
