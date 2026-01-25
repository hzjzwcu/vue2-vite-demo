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
          { source: '1', target: '2' },
          { source: '1', target: '2', id: '1-2-b' },
          { source: '2', target: '3' },
          { source: '3', target: '4' },
          { source: '4', target: '1' },
          { source: '2', target: '5' },
          { source: '5', target: '6' },
          { source: '6', target: '1' },
          { source: '2', target: '7' },
          { source: '7', target: '8' },
          { source: '8', target: '9' },
          { source: '9', target: '2' },
        ],
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
        edge: {
            type: 'quadratic', // Use quadratic for a single-bend curve
            style: {
                endArrow: true,
            }
        },
        layout: {
          type: 'radial',
          focusNode: '1',
          linkDistance: 200,
          preventOverlap: true,
          unitRadius: 100,
        },
        behaviors: ['drag-canvas', 'drag-element', 'zoom-canvas'],
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
  width: 800px;
  height: 500px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-left: 20px;
}
</style>
