<template>
  <div class="page-x">
    <!-- 【步骤1】 创建容器 -->
    <div class="g6-x" id="containerG6" ref="containerG6"></div>
  </div>
</template>

<script>
// 【步骤2】 引入G6
import { Graph } from '@antv/g6';

export default {
  data() {
    return {
      graph: null
    }
  },
  methods: {
    initGraph() {
      const data = {
        nodes: new Array(16).fill(0).map((_, i) => ({ id: `${i}` })),
        edges: new Array(15).fill(0).map((_, i) => ({ source: `${i}`, target: `${i + 1}` })),
      };
      const graph = new Graph({
        container: 'containerG6',
        data,
        node: {
          style: {
            labelFill: '#fff',
            labelPlacement: 'center',
            labelText: (d) => d.id,
          },
        },
        layout: {
          type: 'snake',
          padding: 50,
        },
        behaviors: ['drag-canvas', 'drag-element'],
      });
      graph.render();
    }
  },
  mounted() {
    this.initGraph()
  }
};
</script>

<style scoped>
.g6-x {
  width: 800px;
  height: 500px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-left: 20px;
}
</style>
