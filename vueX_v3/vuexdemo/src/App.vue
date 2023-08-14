<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <h1>name: {{ nodeInfo.name }}</h1>
    <h1>age: {{ nodeInfo.age }}</h1>
    <h1>words: {{ nodeInfo.words }}</h1>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import { mapState } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      nodeInfo: {
        name: '-',
        age: 0,
        words: 'hello vue'
      }
    }
  },
  components: {
    HelloWorld
  },
  computed: {
    // ...mapState(['nodeInfo']),
    // ...mapState({
    //   nodeInfo: state => state.nodeInfo
    // }),
    localNodeInfo() {
      return this.$store.state.nodeInfo;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
