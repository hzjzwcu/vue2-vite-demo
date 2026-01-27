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
  props: {
    graphData: {
      type: Object,
      required: true,
      default: () => ({ nodes: [], edges: [] })
    }
  },
  data() {
    return {
      graph: null
    }
  },
  watch: {
    graphData: {
      handler(newData) {
        if (this.graph) {
          this.graph.changeData(newData);
        } else {
          this.initGraph();
        }
      },
      deep: true
    }
  },
  methods: {
    initGraph() {
      if (this.graph) {
        this.graph.destroy();
      }
      const graph = new Graph({
        container: this.$refs.containerG6,
        data: this.graphData,
        node: {
          style: {
            fill: '#008000', // 绿色
            size: 70, // 节点大小
            labelFill: '#333333', // 深灰色
            labelPlacement: 'center',
            labelText: (d) => d.id,
          },
        },
        edge: {
            type: 'quadratic',
            style: {
                stroke: '#333333', // 深灰色
                endArrow: true,
            },
            state: {
              hover: {
                stroke: '#1890ff',
                lineWidth: 3,
              },
            },
        },
        layout: {
          type: 'radial',
          focusNode: '1',
          linkDistance: 300,
          preventOverlap: true,
          unitRadius: 150,
        },
        behaviors: [
          'drag-canvas', 
          'drag-element', 
          'zoom-canvas',
          'hover-activate',
        ],
        plugins: [
          {
            type: 'tooltip',
            itemTypes: ['edge'],
            getContent(e, items) {
              const item = items[0];
              if (item && item.data && item.data.amount1) {
                return `
                  <div>
                    <div>金额1：${item.data.amount1}</div>
                    <div>金额2：${item.data.amount2}</div>
                  </div>
                `;
              }
              return '';
            },
          },
        ],
        transforms: [{ type: 'process-parallel-edges' }],
      });

      this.graph = graph;
      graph.render();
    }
  },
  mounted() {
    this.initGraph()
  }
};
</script>

<style scoped>
.page-x {
  position: relative;
  width: 100%;
  height: 100%;
}
.g6-x {
  width: calc(100vw - 50px);
  height: calc(100vh - 100px);
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-left: 20px;
}
</style>