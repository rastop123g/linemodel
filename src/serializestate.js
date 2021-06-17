export default function(climat) {
  return {
    temp: toNumber(climat.temp),
    wind: toNumber(climat.wind),
    b:  toNumber(climat.b)
  }
}

function toNumber(value) {
  return Number(String(value).replace(',','.'))
}