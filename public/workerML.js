importScripts('Line.js')

onmessage = function(e) {
  let maxL = 201
  let dL = 40;
  let follow;
  let indat = e.data.indata
  let wire = new Wire(indat)
  Object.defineProperty(indat.coordinate, 'XB', {set: (x)=> {
    wire.init.coordinate.xB = x
    wire.l = Math.abs(wire.init.coordinate.xB - wire.init.coordinate.xA)
  }})
  let ng = wire.getAnyG(indat.climat.wind * 0.25, indat.climat.b*1e+3)
  let nT = indat.wire.maxT * indat.wire.A
  let a = nT / ng
  let f = function(L) {
    return a*Math.cosh(L/(2*a)) - a
  }
  while(true) {
    if(f(maxL) > indat.fmax) {
      if(follow === false) dL = dL/2
      follow = true
      maxL -= dL
    } else if(f(maxL) < indat.fmax - 0.01) {
      if(follow === true) dL = dL/2
      follow = false
      maxL += dL
    } else {
      break;
    }
  }
  follow = null
  dL = maxL / 20
  while(true) {
    indat.coordinate.XB = indat.coordinate.xA + maxL
    let state = wire.getTrueState()
    console.log(maxL, dL)
    if(state.state) {
      if(dL <= maxL*0.05) break;
      if(follow === false) dL = dL/2
      follow = true
      maxL += dL
    } else {
      if(follow === true) dL = dL/2
      follow = false
      maxL -= dL
    }
  }
  postMessage(maxL)
}