var html = require('choo/html')

module.exports = function (state, emit) {
  var search = state.settings.search
  var favorites = state.settings.favorites
  var l = state.settings.ui.lookup

  function renderFavorite (r) {
    if (favorites.find(i => i.id === r.id)) {
      return html`<div class="favorite">
        <div title=${l('search_tab_remove_favorite')} class="emoji-icon-large" style="cursor: pointer;" onclick=${(ev) => onRemoveFavorite(ev, r)}>❤</div>
      </div>`
    } else {
      return html`<div class="favorite">
        <div title=${l('search_tab_add_favorite')} class="emoji-icon-large" style="cursor: pointer;" onclick=${(ev) => onAddFavorite(ev, r)}>🖤</div>
      </div>`
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
      <div>
        <input name="query" type="text" value=${search.query || ''}>
        <button>?</button>
      </div>
    </form>
    <div class="results">
      ${search.results.map(r => html`<div class="result" onclick=${() => jump(r)}>
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
        ${renderFavorite(r)}
      </div>`)}
    </div>
  </div>`

  function onSearch (ev) {
    ev.preventDefault()
    var q = ev.target.elements.query.value
    if (q === '') emit('search:clear')
    else emit('search:query', q)
  }

  function jump (r) {
    emit('map:center', [ r.longitude, r.latitude ])
  }
}

function admin(r) {
  return [r.admin1,r.admin2,r.admin3,r.admin4,r.countryCode].filter(x => x && !/^\d/.test(x))
}
