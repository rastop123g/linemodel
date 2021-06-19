<template>
  <div id="draw">
    <Draw :indata="drawData" :loading="loading" :maxL="maxLength"></Draw>
  </div>
  <div id="main-divider"></div>
  <div id="indata">
    <Indata @UpdateInit="onUpdateInit" @UpdateState="onUpdateState"></Indata>
  </div>
</template>

<script>
import Draw from './components/Draw.vue'
import Indata from './components/Indata.vue'

export default {
  name: 'App',
  components: {
    Draw,
    Indata
  },
  data: function () {
    return {
      drawData: null,
      loading: false,
      maxLength: NaN
    }
  },
  methods: {
    onUpdateInit(data) {
      this.indata = data
      this.createdWorkerUI()
      this.workerUI.postMessage(data)
      this.loading = true
    },
    onUpdateState(data) {
      this.createdWorkerUS()
      this.workerUS.postMessage({
        climat: data,
        TrueState: this.TrueState,
        indata: this.indata
      })
    },
    getMaxLength() {
      this.createdWorkerML()
      this.workerML.postMessage({
        indata: this.indata
      })
    },
    createdWorkerUI() {
      if(this.workerUI) this.workerUI.terminate()
      this.workerUI = new Worker('workerUI.js');
      this.workerUI.onmessage = (e) => {
        this.TrueState = e.data.TrueState
        this.drawData = e.data
        this.loading = false
        this.getMaxLength()
      }
    },
    createdWorkerUS() {
      if(this.workerUS) this.workerUS.terminate()
      this.workerUS = new Worker('workerUS.js');
      this.workerUS.onmessage = (e) => {
        this.TrueState = e.data.TrueState
        this.drawData = e.data
        this.loading = false
      }
    },
    createdWorkerML() {
      this.maxLength = NaN;
      if(this.workerML) this.workerML.terminate()
      this.workerML = new Worker('workerML.js');
      this.workerML.onmessage = (e) => {
        this.maxLength = e.data
      }
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin:0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
}

#draw {
  width: 70%;
  height: 100%;
}

#indata {
  width: 30%;
  height: 100%;
  overflow-y: scroll;
}

#main-divider {
  height: 95%;
  border-left:1px solid black;
}

body {
  margin: 0;
  overflow-x: hidden ;
}
</style>
