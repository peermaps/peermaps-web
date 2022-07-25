var html = require('choo/html')

module.exports = function (state, emit) {
  var search = state.settings.search
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
      </div>`)}
    </div>
  </div>`
  function onSearch(ev) {
    ev.preventDefault()
    var q = ev.target.elements.query.value
    if (q === '') emit('search:clear')
    else emit('search:query', q)
  }
  function jump(r) {
    emit('map:center', [ r.longitude, r.latitude ])
  }
}

function admin(r) {
  return [r.admin1,r.admin2,r.admin3,r.admin4,r.countryCode].filter(x => x && !/^\d/.test(x))
}
