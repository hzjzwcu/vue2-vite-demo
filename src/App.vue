<template>
  <div id="app">
    <div class="tabs">
      <button
        @click="activeTab = 'G6Demo'"
        :class="{ active: activeTab === 'G6Demo' }"
      >
        G6
      </button>
      <button
        @click="activeTab = 'CytoscapeDemo'"
        :class="{ active: activeTab === 'CytoscapeDemo' }"
      >
        Cytoscape
      </button>
      <button
        @click="activeTab = 'EchartsDemo'"
        :class="{ active: activeTab === 'EchartsDemo' }"
      >
        ECharts
      </button>
      <button
        @click="activeTab = 'D3Demo'"
        :class="{ active: activeTab === 'D3Demo' }"
      >
        D3.js
      </button>
    </div>
    <div class="content">
      <component :is="activeTab" :graphData="g6Data"></component>
    </div>
  </div>
</template>

<script>
import CytoscapeDemo from "./components/CytoscapeDemo.vue";
import EchartsDemo from "./components/EchartsDemo.vue";
import D3Demo from "./components/D3Demo.vue";
import G6Demo from "./components/G6Demo.vue";

export default {
  name: "App",
  components: {
    CytoscapeDemo,
    EchartsDemo,
    D3Demo,
    G6Demo,
  },
  data() {
    return {
      activeTab: "G6Demo",
      g6Data: {
        nodes: [
          { id: "1", label: "四川高速公路建设开发集团有限公司1" },
          { id: "2", label: "四川高速公路建设开发集团有限公司2" },
          { id: "3", label: "四川高速公路建设开发集团有限公司3" },
          { id: "4", label: "四川高速公路建设开发集团有限公司4" },
          { id: "5", label: "四川高速公路建设开发集团有限公司5" },
          { id: "6", label: "四川高速公路建设开发集团有限公司6" },
          { id: "7", label: "四川高速公路建设开发集团有限公司7" },
          { id: "8", label: "四川高速公路建设开发集团有限公司8" },
          { id: "9", label: "四川高速公路建设开发集团有限公司9" },
        ],
        edges: [
          {
            source: "1",
            target: "2",
            data: { amount1: "1000元", amount2: "5000元" },
          },
          {
            source: "1",
            target: "2",
            id: "1-2-b",
            data: { amount1: "2000元", amount2: "3000元" },
          },
          {
            source: "2",
            target: "3",
            data: { amount1: "1500元", amount2: "4500元" },
          },
          {
            source: "3",
            target: "4",
            data: { amount1: "3000元", amount2: "2000元" },
          },
          {
            source: "4",
            target: "1",
            data: { amount1: "2500元", amount2: "3500元" },
          },
          {
            source: "2",
            target: "5",
            data: { amount1: "4000元", amount2: "1000元" },
          },
          {
            source: "5",
            target: "6",
            data: { amount1: "500元", amount2: "5500元" },
          },
          {
            source: "6",
            target: "1",
            data: { amount1: "6000元", amount2: "1000元" },
          },
          {
            source: "2",
            target: "7",
            data: { amount1: "1200元", amount2: "2800元" },
          },
          {
            source: "7",
            target: "8",
            data: { amount1: "3200元", amount2: "1800元" },
          },
          {
            source: "8",
            target: "9",
            data: { amount1: "4200元", amount2: "800元" },
          },
          {
            source: "9",
            target: "2",
            data: { amount1: "2200元", amount2: "4800元" },
          },
        ],
      },
    };
  },
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
