var level = require('level')

module.exports = function (state, emitter) {
  state.db = level('peermaps-web')
}
