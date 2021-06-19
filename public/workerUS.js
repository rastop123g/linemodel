importScripts('Line.js')

onmessage = function(e) {
  let climat = e.data.climat
  let wire = new Wire(e.data.indata, e.data.TrueState)
  postMessage(wire.getAnyConditions(climat.wind, climat.b, climat.temp))
}