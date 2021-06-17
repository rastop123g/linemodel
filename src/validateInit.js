export default function(coordinate, climat, wire, fmax) {
  for(let key in coordinate) {
    if(isNaN(coordinate[key])) return false
  }
  for(let key in climat) {
    if(isNaN(climat[key])) return false
  }
  for(let key in wire) {
    if(isNaN(wire[key])) return false
  }
  if(isNaN(fmax)) return false
  if(Math.abs(coordinate.xA - coordinate.xB) < 1) return false;
  if(climat.tmax-climat.tmin <= 0) return false;
  if(wire.d <=0 || wire.A <=0 || wire.maxT <=0 || wire.weight <=0 || wire.tplus <=0 || wire.E <=0) return false
  if(fmax <= 0) return false
  return true
}