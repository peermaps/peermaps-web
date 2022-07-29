function centerViewbox (lonlat) {
  var dx = 0.01
  var dy = 0.005
  return [
    lonlat[0]-dx, lonlat[1]-dy,
    lonlat[0]+dx, lonlat[1]+dy
  ]
}

exports.centerViewbox = centerViewbox
