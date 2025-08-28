<template>
  <div id="app">
    <MGraph />
  </div>
</template>

<script>
import MGraph from "./components/MGraph.vue";

export default {
  name: "App",
  components: {
    MGraph,
  },
};
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
