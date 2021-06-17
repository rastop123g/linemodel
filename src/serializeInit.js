export default function(coordinate, climat, wire, fmax) {
  return {
    coordinate: {
      xA: toNumber(coordinate.xA),
      xB: toNumber(coordinate.xB),
      yA: toNumber(coordinate.yA),
      yB: toNumber(coordinate.yB)
    },
    climat: {
      b: toNumber(climat.b),
      wind: toNumber(climat.wind),
      tmax: toNumber(climat.tmax),
      tmin: toNumber(climat.tmin)
    },
    wire: {
      weight: toNumber(wire.weight),
      E: toNumber(wire.E),
      tplus: toNumber(wire.tplus),
      d: toNumber(wire.d),
      maxT: toNumber(wire.maxT),
      A: toNumber(wire.A)
    },
    fmax: toNumber(fmax)
  }
}

function toNumber(value) {
  return Number(String(value).replace(',','.'))
}