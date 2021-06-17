export function line(a, xb, yb) {
  return function(x) {
    return a*Math.cosh((x-xb)/a) + yb
  }
}

export function getPoints(fx, minX, maxX) {
  let dx = (maxX - minX) / 100
  let f = line(fx.a, fx.xb, fx.yb);
  let result = []
  for(let x = minX; x<=maxX; x+=dx) {
    result.push({
      x,
      y: f(x)
    })
  }
  return result
}

export function transformCoordinate(height, width, maxX, minX, maxY, minY) {
  let Xrange = maxX - minX
  let Yrange = maxY - minY
  return function({x,y}) {
    return [
      ((x-minX)/Xrange) * width,
      ((maxY-y)/Yrange) * height
    ]
  }
}