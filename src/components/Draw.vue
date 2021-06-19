<template>
  <div id="Wrapdraw">
    <div><h1>Визуализация модели</h1></div>
    <div v-bind:class="{'noWiew' : !indata}">
      <h3>Максимальная длина пролета для данных условий:</h3>
      <h3 v-if="ismaxL">{{maxL.toFixed(0)}} м</h3>
      <div v-else-if="!ismaxL" class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
    <div id="candiv">
      <div v-if="loading">
        <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="indata === null">
        <h3>Введите данные для построения модели</h3>
        <p>
          Для расчета параметров провисающего провода используется уравнение идеальной гибкой нерастяжимой нити.
        </p>
        <p>Для построения модели начните вводить входные данные и модель начнет рассчитываться автоматически. </p>
        <p>На входные данные наложено ряд ограничений:</p>
        <p class="text-left">|xA-xB|>0</p>
        <p class="text-left">Максимальная температура должна быть больше минимальной</p>
        <p class="text-left">Следует также учитывать что при визуализации модели земля имеет координаты Y=0, поэтому стоит разумно выбирать эту координату</p>
      </div>
      <div v-else-if="indata === false" >
        <h3>Такого пролета не существует</h3>
        <p class="mx-4">Это означает что при данных входных условиях невозможно подвесить провод так
           чтобы при всех возможных климатических условиях стрела провеса и механические напряжения в проводе соответствовали допустимым.
        </p>
        <p>При неизменных климатических условиях, следует либо повысить допускаемую стрелу провеса, либо понизить длину пролета</p>
        <p>Максимальная длина пролета для текущих условий:</p>
        <p v-if="ismaxL">{{maxL.toFixed(0)}} м</p>
        <div v-else-if="!ismaxL" class="d-flex justify-content-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
    <!-- <div id="footer"></div> -->
  </div>
</template>

<script>
import {getPoints, transformCoordinate} from '../helpers.js'

export default {
  name: 'Draw',
  props: ['indata', 'loading', 'maxL'],
  data: function() {
    return {
    }
  },
  computed: {
    ismaxL() {
      if(isNaN(this.maxL)) {
        return false
      } else {
        return true
      }
    }
  },
  watch: {
    indata() {
      if(this.indata !== null && this.indata !== false) {
        this.DrawNewLine()
      }
    },
    loading() {
      if(this.loading === true) {
        let preCanvas = document.getElementById('canvid')
        if(preCanvas) {
          preCanvas.remove()
        }
      }
    }
  },
  methods: {
    DrawNewLine() {
      let wrap = document.getElementById('candiv');
      let preCanvas = document.getElementById('canvid')
      if(preCanvas) {
        preCanvas.remove()
      }
      let canvas = document.createElement('canvas');
      canvas.id     = "canvid";
      canvas.width  = Number((getComputedStyle(wrap).width).replace('px', ''));
      canvas.height = Number((getComputedStyle(wrap).height).replace('px', ''));
      wrap.appendChild(canvas)
      let height = Number((getComputedStyle(canvas).height).replace('px', ''))
      let width = Number((getComputedStyle(canvas).width).replace('px', ''))
      let maxX = this.indata.coordinate.xB > this.indata.coordinate.xA ? this.indata.coordinate.xB : this.indata.coordinate.xA
      let minX = this.indata.coordinate.xB > this.indata.coordinate.xA ? this.indata.coordinate.xA : this.indata.coordinate.xB
      let points = getPoints(this.indata.fx, minX, maxX)
      let rangeX = maxX-minX;
      maxX += rangeX*0.2
      minX -= rangeX*0.2
      let maxY = this.indata.coordinate.yB > this.indata.coordinate.yA ? this.indata.coordinate.yB : this.indata.coordinate.yA
      maxY += maxY*0.2
      let minY = -0.2*maxY
      let f = transformCoordinate(height, width, maxX, minX, maxY, minY)
      let limits = {
        minX,
        maxX,
        minY,
        maxY,
        width,
        height
      }
      let ctx = canvas.getContext('2d')
      this.drawPillar(ctx, limits, f, this.indata)
      this.drawGround(ctx, limits, f)
      this.drawGrid(ctx,limits,f)
      ctx.beginPath()
      ctx.lineWidth = 5
      ctx.moveTo(...f(points[0]))
      points.forEach(p => {
        ctx.lineTo(...f(p))
      })
      ctx.stroke()
      this.drawStateValue(ctx,limits,this.indata)
    },
    drawStateValue(ctx, limits, indata) {
      ctx.textAlign = 'center'
      ctx.font = '16px Arial'
      ctx.textBaseline = 'middle'
      let y = limits.height - 0.2*0.4*limits.height/1.4
      let x = limits.width/10
      let dx = limits.width/5
      ctx.fillText('t = ' + indata.climat.t.toFixed(1) + ' °C', x, y)
      x += dx
      ctx.fillText('b = ' + indata.climat.b.toFixed(1) + ' мм', x, y)
      x += dx
      ctx.fillText('Ветер: ' + indata.climat.wind.toFixed(1) + ' м/c', x, y)
      x += dx
      ctx.fillText('f = ' + indata.f.toFixed(2) + ' м', x, y)
      x += dx
      ctx.fillText('σ = ' + (indata.maxTension * 1e-6).toFixed(3) + ' МПа', x, y)
    },
    drawGround(ctx, limits, f) {
      ctx.beginPath()
      ctx.lineWidth = 3
      ctx.moveTo(...f({
        x: limits.minX,
        y: 0
      }))
      ctx.lineTo(...f({
        x: limits.maxX,
        y: 0
      }))
      let ground = document.createElement('img')
      ground.src = 'groundpattern.jpg'
      ground.onload = () => {
        let pattern = ctx.createPattern(ground, 'repeat')
        ctx.fillStyle = pattern
        ctx.fillRect(...f({
          x: limits.minX,
          y: 0 
        }), limits.width, limits.height*(0.2*0.2)/1.4)
      }
      ctx.stroke()
    },
    drawGrid(ctx, limits, f) {
      let dx = 60
      let dy = 40
      let y0 = f({x:0,y:0})[1];
      ctx.lineWidth = 1
      for(let x = dx; x<limits.width; x+=dx) {
        ctx.beginPath()
        let value = limits.minX + (x/limits.width)*(limits.maxX - limits.minX)
        let y = parseInt((y0 / dy).toFixed(), 10)*dy
        ctx.moveTo(x+0.5, 0)
        ctx.lineTo(x+0.5, y0)
        ctx.stroke()
        ctx.clearRect(x-30, y-35, 60, 30)
        ctx.textAlign = 'center'
        ctx.font = '16px Arial'
        ctx.textBaseline = 'middle'
        ctx.fillText(value.toFixed(1), x, y - 20)
      }
      for(let y = dy; y<y0; y+=dy) {
        let value = limits.maxY - (y/limits.height)*(limits.maxY - limits.minY)
        ctx.beginPath()
        ctx.moveTo(0, y+0.5)
        ctx.lineTo(limits.width, y+0.5)
        ctx.stroke()
        if(y+dy < y0) {
          ctx.clearRect(5, y-20, 50, 40)
          ctx.textAlign = 'center'
          ctx.font = '16px Arial'
          ctx.textBaseline = 'middle'
          ctx.fillText(value.toFixed(1), 30, y)
        }
      }
    },
    drawPillar(ctx, limits, f, indata) {
      ctx.beginPath()
      ctx.arc(...f({
        x: indata.coordinate.xA,
        y: indata.coordinate.yA
      }), 10, 0, 2*Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(...f({
        x: indata.coordinate.xA,
        y: indata.coordinate.yA
      }))
      ctx.lineWidth = 16
      ctx.lineTo(...f({
        x: indata.coordinate.xA,
        y: 0
      }))
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(...f({
        x: indata.coordinate.xB,
        y: indata.coordinate.yB
      }), 10, 0, 2*Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(...f({
        x: indata.coordinate.xB,
        y: indata.coordinate.yB
      }))
      ctx.lineWidth = 16
      ctx.lineTo(...f({
        x: indata.coordinate.xB,
        y: 0
      }))
      ctx.stroke()
    }
  },
}
</script>

<style scoped>
  #Wrapdraw {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #candiv {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #footer {
    height: 100px;
  }

  p {
    margin-bottom: 0;
    text-align: center;
    font-size: 1.2rem;
  }

  .noWiew {
    opacity: 0;
  }

  /* .text-left {
    text-align: left;
  } */
</style>
