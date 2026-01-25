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
        nodes: [
          { id: '1' },
          { id: '2' },
          { id: '3' },
          { id: '4' },
          { id: '5' },
          { id: '6' },
          { id: '7' },
          { id: '8' },
          { id: '9' },
        ],
        edges: [
          { source: '1', target: '2', amount1: '1000元', amount2: '5000元' },
          { source: '1', target: '2', id: '1-2-b', amount1: '2000元', amount2: '3000元' },
          { source: '2', target: '3', amount1: '1500元', amount2: '4500元' },
          { source: '3', target: '4', amount1: '3000元', amount2: '2000元' },
          { source: '4', target: '1', amount1: '2500元', amount2: '3500元' },
          { source: '2', target: '5', amount1: '4000元', amount2: '1000元' },
          { source: '5', target: '6', amount1: '500元', amount2: '5500元' },
          { source: '6', target: '1', amount1: '6000元', amount2: '1000元' },
          { source: '2', target: '7', amount1: '1200元', amount2: '2800元' },
          { source: '7', target: '8', amount1: '3200元', amount2: '1800元' },
          { source: '8', target: '9', amount1: '4200元', amount2: '800元' },
          { source: '9', target: '2', amount1: '2200元', amount2: '4800元' },
        ],
      };

      const graph = new Graph({
        container: this.$refs.containerG6, // 关键修改：使用 ref 获取 DOM 元素
        data,
        node: {
          style: {
            labelFill: '#fff',
            labelPlacement: 'center',
            labelText: (d) => d.id,
          },
        },
        edge: {
            type: 'quadratic', // Use quadratic for a single-bend curve
            style: {
                endArrow: true,
            },
            state: {
              hover: {
                stroke: '#1890ff', // A highlight color for hover
                lineWidth: 3,
              },
            },
        },
        layout: {
          type: 'radial',
          focusNode: '1',
          linkDistance: 200,
          preventOverlap: true,
          unitRadius: 100,
        },
        behaviors: [
          'drag-canvas', 
          'drag-element', 
          'zoom-canvas',
          'hover-activate',
        ],
        transforms: [{ type: 'process-parallel-edges' }], // Add the transform here
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
  width: calc(100vw - 50px);
  height: calc(100vh - 100px);
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-left: 20px;
}
</style>
