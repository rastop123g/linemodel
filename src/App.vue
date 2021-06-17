<template>
  <div id="draw">
    <Draw :indata="drawData" :loading="loading"></Draw>
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
      loading: false
    }
  },
  methods: {
    onUpdateInit(data) {
      this.indata = data
      if(this.worker) this.worker.terminate()
      this.createdWorker()
      this.worker.postMessage({
        data,
        message: 'newWire'
      })
      this.loading = true
    },
    onUpdateState(data) {
      if(this.worker) this.worker.terminate()
      this.createdWorker()
      this.worker.postMessage({
        climat: data,
        TrueState: this.TrueState,
        indata: this.indata,
        message: 'getState'
      })
    },
    createdWorker() {
      this.worker = new Worker('worker.js');
      this.worker.onmessage = (e) => {
        this.TrueState = e.data.TrueState
        this.drawData = e.data
        this.loading = false
      }
    },
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
