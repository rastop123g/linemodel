importScripts('Line.js')

onmessage = function(e) {
  let result;
  let wire = new Wire(e.data)
  wire.getTrueState()
  if(wire.lastState.state){
    result = wire.getAnyConditions(0,0,0)
  } else {
    result = false
  }
  postMessage(result)
}