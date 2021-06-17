onmessage = function(e) {
  if(e.data.message == "newWire") {
    let result;
    let wire = new Wire(e.data.data)
    let state = wire.getTrueState()
    if(state.state){
      result = wire.getAnyConditions(0,0,0,state.Th0,state.L0)
    } else {
      result = false
    }
    postMessage(result)
  }
  if(e.data.message == "getState") {
    let climat = e.data.climat
    let state = e.data.TrueState
    let wire = new Wire(e.data.indata, state)
    postMessage(wire.getAnyConditions(climat.wind, climat.b, climat.temp, state.Th0, state.L0))
  }
}

const FLIMIT = Symbol()
const TLIMIT = Symbol()
const LLIMIT = Symbol()
const TRUESTATE = Symbol()

function integrate(fx,a,b,parts) {
  let dx = (b-a) / parts;
  let result = 0;
  for(let i = 0; i<parts;i++) {
    result += fx(a+(i+0.5)*dx) * dx
  }
  return result
}

function difference(fx,x) {
  let dx = 1;
  let error = 0;
  let diff1;
  let diff2;
  while(true) {
    diff1 = (fx(x+dx) - fx(x-dx))/(2*dx)
    dx = dx/2
    diff2 = (fx(x+dx) - fx(x-dx))/(2*dx)
    error = Math.abs(diff1-diff2)
    if(error < 1e-8) return diff2
  }
}

function line(a, xb, yb) {
  return function(x) {
    return a*Math.cosh((x-xb)/a) + yb
  }
}

class Wire {
  cst = {
    g: 9.81,
    rice: 916.7,
    mm: 1e-3
  }

  constructor(initData, lastState = null) {
    this.init = this.toStandart(initData);
    this.l = Math.abs(initData.coordinate.xB - initData.coordinate.xA)
    this.g = []
    this.getCriticalCondition()
    this.lastState = lastState;
  }

  getCriticalCondition() {
    let g0 = this.init.wire.weight * this.cst.g
    this.g0 = g0
    let gice = Math.PI * (this.init.climat.b*this.init.wire.d + Math.pow(this.init.climat.b, 2)) * this.cst.rice * this.cst.g + g0
    let gwind = Math.sqrt(Math.pow(g0, 2)+Math.pow(this.init.climat.wind*this.init.wire.d, 2))
    let gwindice = Math.sqrt(Math.pow(gice, 2) + Math.pow(0.25*this.init.climat.wind*(this.init.wire.d + 2*this.init.climat.b), 2))
    this.criticalCondition = [
      {
        g: gwind,
        t: this.init.climat.tmax
      },
      {
        g: gwindice,
        t: -5
      },
      {
        g: gwind,
        t: this.init.climat.tmin
      }
    ]
  }

  toStandart(data) {
    let result = data;
    result.climat.b = result.climat.b / 1000
    result.wire.E = result.wire.E * 1e+7
    result.wire.d = result.wire.d / 1000
    result.wire.maxT = result.wire.maxT * 1e+7
    result.wire.A = result.wire.A / 1e+6
    return result
  }

  findInitTh0() {
    let a = this.l * 5
    let da = a / 100
    let followAdd;
    while(true) {
      let f = a*Math.cosh(this.l/(2*a)) - a
      if(f>this.init.fmax + 0.1) {
        if(followAdd === false) da = da/2
        a += da
        followAdd = true;
      } else if(f<this.init.fmax - 0.1) {
        if(followAdd === true) da = da/2
        a -= da
        followAdd = false;
      } else {
        break;
      }
    }
    return a * this.g0
  }

  getBias(a) {
    let followAdd;
    let dx = this.init.coordinate.xB > this.init.coordinate.xA ? this.l/100 : -this.l/100
    let xb = this.init.coordinate.xB > this.init.coordinate.xA ? this.init.coordinate.xA + dx : this.init.coordinate.xA + dx
    let yb = this.init.coordinate.yB > this.init.coordinate.yA ? this.init.coordinate.yA - a - this.init.fmax/10 : this.init.coordinate.yB - a - this.init.fmax/10
    while(true) {
      let fx = line(a, xb, yb);
      if(Math.abs(fx(this.init.coordinate.xA)-this.init.coordinate.yA)>this.cst.mm || Math.abs(fx(this.init.coordinate.xB)-this.init.coordinate.yB)>this.cst.mm) {
        yb -= fx(this.init.coordinate.xA) - this.init.coordinate.yA;
        if(fx(this.init.coordinate.xB) - this.init.coordinate.yB > 0) {
          dx = followAdd === false ? dx/2 : dx
          followAdd = true;
          xb += dx
        } else if(fx(this.init.coordinate.xB) - this.init.coordinate.yB < 0) {
          dx = followAdd === true ? dx/2 : dx
          followAdd = false;
          xb -= dx
        } else break;
      } else {
        break;
      }
    }
    return {
      xb,
      yb
    }
  }

  getTrueState() {
    let Th0 = this.findInitTh0();
    let dTh0 = Th0/10;
    let follow;
    do {
      let checkT = this.getState(Th0)
      if(checkT === TRUESTATE) {
        this.lastState.state = true
        return this.lastState
      }
      if(checkT === LLIMIT) {
        this.lastState.state = false
        return this.lastState
      }
      if(checkT === FLIMIT) {
        if(follow === true) dTh0 = dTh0 / 2
        follow = false
      }
      if(checkT === TLIMIT) {
        if(follow === false) dTh0 = dTh0 / 2
        follow = true
      }
    }
    while(Th0 = follow ? Th0 - dTh0 : Th0 + dTh0)
  }

  getState(Th0) {
    this.lastState = {}
    let state = new Set()
    let L0 = this.getLengthLessTension(Th0, this.g0)
    this.criticalCondition.forEach((e, idx) => {
      let thistate = this.checkConditions(e.g, e.t, Th0, L0)
      if(!thistate.f) state.add(FLIMIT)
      if(!thistate.maxTension) state.add(TLIMIT)
    })
    this.lastState.L0 = L0
    this.lastState.Th0 = Th0
    if(state.size == 0) return TRUESTATE;
    if(state.size == 2) return LLIMIT;
    if(state.has(FLIMIT)) return FLIMIT;
    if(state.has(TLIMIT)) return TLIMIT;
  }

  getAnyConditions(w, b, t, Th0, L0) {
    let g = this.getAnyG(w,b)
    let Th = this.getTfort(Th0, g, L0, t)
    let a = Th / g
    let bias = this.getBias(a)
    let fx = line(a, bias.xb,bias.yb)
    let Ymin = this.init.coordinate.yA > this.init.coordinate.yB ? this.init.coordinate.yB : this.init.coordinate.yA
    let Xmax = this.init.coordinate.yA > this.init.coordinate.yB ? this.init.coordinate.xA : this.init.coordinate.xB
    let f = Ymin - a - bias.yb
    let maxTension = Th / (this.init.wire.A * Math.cos(Math.atan(difference(fx, Xmax))))
    return {
      f,
      coordinate: this.init.coordinate,
      maxTension,
      fx: {
        a,
        xb: bias.xb,
        yb: bias.yb
      },
      climat: {
        b,
        t,
        wind: Math.sqrt(2*w/1.275)
      },
      TrueState: this.lastState
    }
  }

  getAnyG(w,bmm) {
    let b = bmm * 1e-3
    let g0 = this.g0
    let gice = Math.PI * (b*this.init.wire.d + Math.pow(b, 2)) * this.cst.rice * this.cst.g + g0
    let gwind = Math.sqrt(Math.pow(g0, 2)+Math.pow(w*this.init.wire.d, 2))
    let gwindice = Math.sqrt(Math.pow(gice, 2) + Math.pow(w*(this.init.wire.d + 2*b), 2))
    if(b == 0) {
      return gwind
    } else {
      return gwindice
    }
  }

  checkConditions(g, t, Th0, L0) {
    let Th = this.getTfort(Th0, g, L0, t)
    let a = Th / g
    let bias = this.getBias(a)
    let fx = line(a, bias.xb,bias.yb)
    let Ymin = this.init.coordinate.yA > this.init.coordinate.yB ? this.init.coordinate.yB : this.init.coordinate.yA
    let Xmax = this.init.coordinate.yA > this.init.coordinate.yB ? this.init.coordinate.xA : this.init.coordinate.xB
    let f = Ymin - a - bias.yb
    let maxTension = Th / (this.init.wire.A * Math.cos(Math.atan(difference(fx, Xmax))))
    return {
      f: f < this.init.fmax ? true : false,
      maxTension: maxTension < this.init.wire.maxT ? true : false
    }
  }

  getTfort(Th0, g, L0, t) {
    let dT = Th0 / 10
    let T = Th0
    let follow;
    do{
      let dt = this.getdt(T, g, L0)
      if(dt>(t+1e-2)) {
        if(follow === true) dT = dT/2
        follow = false
      } else if(dt<(t-1e-2)) {
        if(follow === false) dT = dT/2
        follow = true
      } else {
        return T
      }
    } while(T = follow ? T - dT : T + dT)
  }

  getdt(T, g, L0) {
    let newlen = this.getLengthLessTension(T, g)
    return (newlen-L0)/(this.init.wire.tplus * L0)
  }

  getLength(a) {
    let bias = this.getBias(a)
    let min = this.init.coordinate.xA > this.init.coordinate.xB ? this.init.coordinate.xB : this.init.coordinate.xA
    let max = this.init.coordinate.xA > this.init.coordinate.xB ? this.init.coordinate.xA : this.init.coordinate.xB
    return integrate(function(x) {
      return Math.sqrt(1 + Math.pow(difference(line(a, bias.xb, bias.yb), x), 2))
    }, min, max, 10000)
  }

  getLengthLessTension(Th0, g) {
    let a = Th0 / g
    let bias = this.getBias(a)
    let fx = line(a, bias.xb, bias.yb);
    let min = this.init.coordinate.xA > this.init.coordinate.xB ? this.init.coordinate.xB : this.init.coordinate.xA
    let max = this.init.coordinate.xA > this.init.coordinate.xB ? this.init.coordinate.xA : this.init.coordinate.xB
    let Lki = function(x) {
      return 1/Math.cos(Math.atan(difference(fx, x)))
    }
    let tensioni = (x) => {
      return Th0 / (Math.cos(Math.atan(difference(fx, x)))*this.init.wire.A)
    }
    let Li = (x) => {
      return (this.init.wire.E * Lki(x))/(tensioni(x)+this.init.wire.E)
    }
    return integrate(Li, min, max, 10000)
  }
}

class tovarfunc {
  
  constructor() {
    this.points = []
  }

  setPoint(point) {
    this.points.push(point)
  }

  getPoint(params) {
    let error = []
    for(let i = 0; i<this.points.length; i++) {
      let dp = []
      for(let n in params) {
        dp.push(this.points[i][n]-params[n])
      }
      error.push(Math.sqrt(Math.pow(dp[0], 2) + Math.pow(dp[1], 2)))
    }
    let minidx = 0
    let min = error[0]
    for(let i = 0; i<error.length; i++) {
      if(error[i]<min) {
        minidx = i;
        min = error[i];
      }
    }
    return this.points[minidx]
  }
}