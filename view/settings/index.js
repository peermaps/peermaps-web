var html = require('choo/html')
var css = require('sheetify')
var tabViews = {
  search: require('./tabs/search'),
  favorites: require('./tabs/favorites'),
  ui: require('./tabs/ui'),
  storage: require('./tabs/storage')
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
    ${renderResizer(state, emit)}
    ${renderTabs(state, emit)}
    ${renderTabContent(state, emit)}
    ${renderButtons(state, emit)}
  </div>`
}

var guardStyle = css`
  :host {
    position: absolute;
    top: 0px;
    bottom: 0px;
    cursor: col-resize;
    z-index: 100;
  }
`

var resizerStyle = css`
  :host {
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    width: 4px;
    cursor: col-resize;
    background: repeating-linear-gradient(
      -55deg,
      #888,
      #888 4px,
      #999 4px,
      #999 8px
    );
  }
`

function renderResizer (state, emit) {
  function onMouseDown (ev) {
    setVisibility('resize-guard-left', 'visible')
    setVisibility('resize-guard-right', 'visible')
    emit('settings:resize:start', ev.clientX)
  }
  function onMouseUp (ev) {
    setVisibility('resize-guard-left', 'hidden')
    setVisibility('resize-guard-right', 'hidden')
    emit('settings:resize:end')
  }
  function onMouseMove (ev) {
    if (state.settings.resize) {
      emit('settings:resize:move', ev.clientX)
    }
  }
  function setVisibility (id, visibility) {
    var el = document.getElementById(id)
    if (el) el.style.visibility = visibility
  }
  var visibility = state.settings.resize ? 'visible' : 'hidden'
  return html`<div>
    <div id="resize-guard-left" onmouseup=${onMouseUp} onmousemove=${onMouseMove} class=${guardStyle} style="left: -1500px; right: ${state.settings.width}px; visibility: ${visibility};"></div>
    <div id="resize-settings" onmousedown=${onMouseDown} onmouseup=${onMouseUp} onmousemove=${onMouseMove} class=${resizerStyle}></div>
    <div id="resize-guard-right" onmouseup=${onMouseUp} onmousemove=${onMouseMove} class=${guardStyle} style="left: 4px; right: 0px; visibility: ${visibility};"></div>
  </div>`
}

var tabContainerStyle = css`
  :host {
    display: flex;
    justify-content: space-around;
    position: absolute;
    top: 0px;
    bottom: 25px;
    left: 4px;
    right: 0px;
  }
`

var tabStyle = css`
  :host {
    text-align: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
    height: 15px;
  }
`

function renderTabs (state, emit) {
  var settings = state.settings
  var l = settings.ui.lookup
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
    return html`<div class=${tabStyle} style=${cstyle} onclick=${() => emit('settings:ontabclick', tab.name)}>${l(`${tab.name}_tab_title`)}</div>`
  })
  return html`<div class=${tabContainerStyle}>${content}</div>`
}

var tabContentStyle = css`
  :host {
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 25px;
    bottom: 40px;
    left: 4px;
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
    left: 4px;
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

  var l = settings.ui.lookup
  return html`<div class=${buttonContainerStyle}>
    <a title=${l('close_settings')}><div class=${buttonStyle} style='max-width: 20px;' onclick=${() => emit('settings:toggle')}><div class="emoji-icon-small">❌</div></div></a>
    <div style='display: flex;'>
      <div class=${buttonStyle} onclick=${() => emit('settings:reset')}>${l('reset_settings')}</div>
      <div class=${buttonStyle} style=${cstyle(settings.canReload)} onclick=${() => onReload()}>${l('reload_settings')}</div>
      <div class=${buttonStyle} style=${cstyle(settings.dirty)} onclick=${() => onApply()}>${l('save_settings')}</div>
    </div>
  </div>`
}
