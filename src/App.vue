<template>
  <div id="app">
    <div class="tabs">
      <button @click="activeTab = 'G6Demo'" :class="{ active: activeTab === 'G6Demo' }">G6</button>
      <button @click="activeTab = 'CytoscapeDemo'" :class="{ active: activeTab === 'CytoscapeDemo' }">Cytoscape</button>
      <button @click="activeTab = 'EchartsDemo'" :class="{ active: activeTab === 'EchartsDemo' }">ECharts</button>
      <button @click="activeTab = 'D3Demo'" :class="{ active: activeTab === 'D3Demo' }">D3.js</button>
    </div>
    <div class="content">
      <component :is="activeTab"></component>
    </div>
  </div>
</template>

<script>
import CytoscapeDemo from './components/CytoscapeDemo.vue';
import EchartsDemo from './components/EchartsDemo.vue';
import D3Demo from './components/D3Demo.vue';
import G6Demo from './components/G6Demo.vue';

export default {
  name: 'App',
  components: {
    CytoscapeDemo,
    EchartsDemo,
    D3Demo,
    G6Demo
  },
  data() {
    return {
      activeTab: 'G6Demo'
    };
  }
};
</script>

<style>
.tabs {
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
.tabs button {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  margin-right: 5px;
}
.tabs button.active {
  background-color: #fff;
  border-bottom-color: #fff;
}
.content {
  margin-top: 20px;
}
</style>
