export default function(climat) {
  for(let key in climat) {
    if(isNaN(climat[key])) return false
  }
  return true
}