<template>
  <h1>Входные данные</h1>
  <!-- координаты точек А и Б -->
  <div class="group">
    <h3 class="group-name">Координаты</h3>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Точка А:</h5>
      </div>
      <div class="col-4">
        <div class="input-group">
          <span class="input-group-text" >X:</span>
          <input type="text" v-model="coordinate.xA" class="form-control">
          <span class="input-group-text">м</span>
        </div>
      </div>
      <div class="col-4">
        <div class="input-group">
          <span class="input-group-text" >Y:</span>
          <input type="text" v-model="coordinate.yA" class="form-control" >
          <span class="input-group-text">м</span>
        </div>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Точка Б:</h5>
      </div>
      <div class="col-4">
        <div class="input-group">
          <span class="input-group-text" >X:</span>
          <input type="text" v-model="coordinate.xB" class="form-control">
          <span class="input-group-text">м</span>
        </div>
      </div>
      <div class="col-4">
        <div class="input-group">
          <span class="input-group-text" >Y:</span>
          <input type="text" v-model="coordinate.yB" class="form-control" >
          <span class="input-group-text">м</span>
        </div>
      </div>
    </div>
  </div>
  <!-- Погодные условия -->
  <div class="group">
    <h3 class="group-name">Климатические условия</h3>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Район по ветру</h5>
      </div>
      <div class="col-8">
        <select class="form-select" v-model="climat.wind" aria-label="Default select example">
          <option selected value="400">I (400)</option>
          <option value="500">II (500)</option>
          <option value="650">III (650)</option>
          <option value="800">IV (800)</option>
          <option value="1000">V (1000)</option>
          <option value="1250">VI (1250)</option>
          <option value="1500">VII (1500)</option>
        </select>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Район по гололеду</h5>
      </div>
      <div class="col-8">
        <select class="form-select" v-model="climat.b" aria-label="Default select example">
          <option selected value="10">I (10)</option>
          <option value="15">II (15)</option>
          <option value="20">III (20)</option>
          <option value="25">IV (25)</option>
          <option value="30">V (30)</option>
          <option value="35">VI (35)</option>
          <option value="40">VII (40)</option>
        </select>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Максимальная температура</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="climat.tmax" class="form-control">
          <span class="input-group-text">&deg;C</span>
        </div>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Минимальная температура</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="climat.tmin" class="form-control">
          <span class="input-group-text">&deg;C</span>
        </div>
      </div>
    </div>
  </div>
  <!-- параметры линии -->
  <div class="group">
    <h3 class="group-name">Параметры линии</h3>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Выберите провод</h5>
      </div>
      <div class="col-8">
        <select class="form-select" v-model="wire">
          <option v-for="(wire, idx) in wires" :key="idx" v-bind:value="wire">{{wire.name}}</option>
        </select>
      </div>
    </div>
    <div v-if="wire_edit" class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Вес</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="wire.weight" class="form-control">
          <span class="input-group-text">кг/м</span>
        </div>
      </div>
    </div>
    <div v-if="wire_edit" class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Модуль упругости</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="wire.E" class="form-control">
          <span class="input-group-text">ДаН/мм2</span>
        </div>
      </div>
    </div>
    <div v-if="wire_edit" class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Кф температурного расширения</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="wire.tplus" class="form-control">
          <span class="input-group-text">&deg;C-1</span>
        </div>
      </div>
    </div>
    <div v-if="wire_edit" class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Диаметр</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="wire.d" class="form-control">
          <span class="input-group-text">мм</span>
        </div>
      </div>
    </div>
    <div v-if="wire_edit" class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Максимальные напряжения</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="wire.maxT" class="form-control">
          <span class="input-group-text">даН/мм2</span>
        </div>
      </div>
    </div>
    <div v-if="wire_edit" class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Площадь сечения</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="wire.A" class="form-control">
          <span class="input-group-text">мм2</span>
        </div>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <button class="btn btn-primary" v-if="!wire_edit" v-on:click="wire_edit = !wire_edit" type="button">Расширенные параметры</button>
      <button class="btn btn-primary" v-if="wire_edit" v-on:click="wire_edit = !wire_edit" type="button">Скрыть</button>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Максимальная стрела провеса</h5>
      </div>
      <div class="col-8">
        <div class="input-group mb-3">
          <input type="text" v-model="fmax" class="form-control">
          <span class="input-group-text">м</span>
        </div>
      </div>
    </div>
  </div>
  <!-- Текущие погодные условия -->
  <div class="group">
    <h3 class="group-name">Текущее состояние</h3>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Температура</h5>
      </div>
      <div class="col-6">
        <div class="input-group mb-3">
          <input type="range" v-model="climat_now.temp" class="form-range" :min="climat.tmin" :max="climat.tmax" id="tempRange">
        </div>
      </div>
      <div class="col-2">
        <p class="text-center">{{climat_now.temp}} &deg;C</p>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Давление ветра</h5>
      </div>
      <div class="col-6">
        <div class="input-group mb-3">
          <input type="range" v-model="climat_now.wind" class="form-range" :min="0" :max="Wmax" id="tempRange">
        </div>
      </div>
      <div class="col-2">
        <p class="text-center">{{climat_now.wind}} Па</p>
      </div>
    </div>
    <div class="row align-items-center my-2 mx-0">
      <div class="col-4">
        <h5>Толщина стенки гололеда</h5>
      </div>
      <div class="col-6">
        <div class="input-group mb-3">
          <input type="range" v-model="climat_now.b" class="form-range" :min="0" :max="bmax" id="tempRange">
        </div>
      </div>
      <div class="col-2">
        <p class="text-center">{{climat_now.b}} мм</p>
      </div>
    </div>
  </div>
</template>

<script>
import wires from '../wires.js'
import ValidateInit from '../validateInit.js'
import ValidateState from '../validateState.js'
import SerializeInit from '../serializeInit.js'
import SerializeState from '../serializestate.js'

export default {
  name: 'Indata',
  emits: ['UpdateInit', 'UpdateState'],
  data: function() {
    return {
      wires,
      wire: wires[1],
      wire_edit: false,
      climat_now: {
        temp: 0,
        wind: 0,
        b: 0
      },
      coordinate: {
        xA: 0,
        yA: 10,
        xB: 0,
        yB: 10
      },
      climat: {
        b: 25,
        wind: 650,
        tmax: 40,
        tmin: -38
      },
      fmax: 2,
      updateInitFlag: 0,
      updateStateFlag: 0
    }
  },
  computed: {
    Wmax() {
      let wmax = this.climat.wind;
      if(this.climat_now.temp < 0 && this.climat_now.temp >= -5) {
        if(this.climat_now.b > 0) {
          wmax = this.climat.wind * 0.25
        }
      }
      return wmax
    },
    bmax() {
      let bmax = 0
      if(this.climat_now.temp < 0 && this.climat_now.temp >= -5) {
        if(this.climat_now.wind <= this.climat.wind * 0.25) {
          bmax = this.climat.b
        }
      }
      return bmax
    }
  },
  watch: {
    climat_now: {
      deep: true,
      handler() {
        this.updateStateStart()
      }
    },
    fmax () {
      this.updateInitStart()
    },
    coordinate: {
      deep: true,
      handler() {
        this.updateInitStart()
      }
    },
    climat: {
      deep: true,
      handler() {
        this.updateInitStart()
      }
    },
    wire: {
      deep: true,
      handler() {
        this.updateInitStart()
      }
    }
  },
  created () {
  },
  methods: {
    updateInitStart() {
      this.updateInit()
    },
    updateStateStart() {
      this.updateState()
    },
    updateInit() {
      let serData = SerializeInit(this.coordinate, this.climat, this.wire, this.fmax);
      if(ValidateInit(serData.coordinate, serData.climat, serData.wire, serData.fmax)) {
        this.$emit('UpdateInit', serData)
      }
    },
    updateState() {
      let serData = SerializeState(this.climat_now);
      if(ValidateState(serData)) this.$emit('UpdateState', serData)
    }
  },
}
</script>

<style>
h5 {
  margin-bottom: 0;
}

.group-name {
  text-align: left;
}

.group {
  padding: 10px;
}

.form-control:focus {
  box-shadow: none!important; 
}
</style>
