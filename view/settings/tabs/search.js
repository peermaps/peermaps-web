var html = require('choo/html')

module.exports = function (state, emit) {
  var search = state.settings.search
  var isSearching = search.isSearching
  var favorites = state.settings.favorites
  var l = state.settings.ui.lookup

  function renderFavorite (r) {
    if (favorites.find(i => i.id === r.id)) {
      return html`<div title=${l('remove_favorite')} class="emoji-icon-large" style="cursor: pointer;" onclick=${(ev) => onRemoveFavorite(ev, r)}>💚</div>`
    } else {
      return html`<div title=${l('add_favorite')} class="emoji-icon-large" style="cursor: pointer;" onclick=${(ev) => onAddFavorite(ev, r)}>🤍</div>`
    }
  }

  function onRemoveFavorite (ev, r) {
    ev.stopPropagation()
    emit('settings:favorites:delete', r)
  }

  function onAddFavorite (ev, r) {
    ev.stopPropagation()
    emit('settings:favorites:add', r)
  }

  return html`<div class="search">
    <form onsubmit=${onSearch}>
      <div style="display: flex;">
        <input name="query" type="text" value=${search.query || ''} disabled=${isSearching}>
        <button title=${l('search_tab_title')} disabled=${isSearching}><div class="emoji-icon-small" style="opacity: ${!isSearching ? '100' : '50'}%;">🔎</div></button>
        <button title=${l('search_tab_abort')} disabled=${!isSearching} onclick=${onAbort}><div class="emoji-icon-small" style="opacity: ${isSearching ? '100' : '50'}%;">🔴</div></button>
      </div>
    </form>
    <div class="results">
      ${search.results.map(r => html`<div class="result">
        <div class="fullname">
          <div class="name">${r.name}</div>
          <div class="admin">${admin(r).join(' ')}</div>
        </div>
        <div class="fields">
          <div class="lonlat">
            ${r.longitude.toFixed(2)},${r.latitude.toFixed(2)}
          </div>
          <div class="population">
            ${r.population}
          </div>
        </div>
        <div class="icons">
          <div title=${l('jump_to_location')} class="emoji-icon-large" style="cursor: pointer;" onclick=${() => jump(r)}>👁</div>
          ${renderFavorite(r)}
        </div>
      </div>`)}
    </div>
  </div>`

  function onSearch (ev) {
    ev.preventDefault()
    var q = ev.target.elements.query.value
    if (q === '') emit('settings:search:clear')
    else emit('settings:search:query', q)
  }

  function onAbort (ev) {
    ev.preventDefault()
    emit('settings:search:abort')
  }

  function jump (r) {
    emit('map:center', [ r.longitude, r.latitude ])
  }
}

function admin(r) {
  return [r.admin1,r.admin2,r.admin3,r.admin4,r.countryCode].filter(x => x && !/^\d/.test(x))
}
