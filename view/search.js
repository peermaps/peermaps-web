var html = require('choo/html')

module.exports = function (state, emit) {
  state.search.inputElement = html`<input
    name="query" type="text" value=${state.search.query || ''}
  >`
  return html`<div class="search ${state.search.visible ? '' : 'hide'}">
    <form onsubmit=${search}>
      <div>
        ${state.search.inputElement}
        <button>?</button>
      </div>
    </form>
    <div class="results">
      ${state.search.results.map(r => html`<div class="result">
        <div class="fullname">
          <div class="name">${r.name}</div>
          <div class="admin">${admin(r).join(' ')}</div>
        </div>
        <div class="fields">
          <div class="population">
            ${r.population}
          </div>
          <div class="lonlat">
            ${r.longitude.toFixed(2)},${r.latitude.toFixed(2)}
          </div>
        </div>
      </div>`)}
    </div>
  </div>`
  function search(ev) {
    ev.preventDefault()
    var q = ev.target.elements.query.value
    if (q === '') emit('search:clear')
    else emit('search:query', q)
  }
}

function admin(r) {
  return [r.admin1,r.admin2,r.admin3,r.admin4,r.countryCode].filter(x => x && !/^\d/.test(x))
}
