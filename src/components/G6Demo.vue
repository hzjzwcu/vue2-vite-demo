<template>
  <div>
    <!-- 1. G6 渲染的容器 -->
    <div id="g6-container"></div>

    <!-- 2. 弹窗的 DOM 结构，使用 v-if 控制显示/隐藏 -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>节点信息</h3>
        <p><strong>ID:</strong> {{ selectedNode.id }}</p>
        <!-- 可以展示更多节点属性 -->
        <p v-for="(value, key) in selectedNode.properties" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </p>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script>
import G6, { Tooltip } from "@antv/g6";

export default {
  name: "G6Demo",
  props: {
    graphData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      graph: null,
      isModalVisible: false,
      selectedNode: {},
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initGraph();
    });
  },
  watch: {
    graphData(newData) {
      if (this.graph) {
        this.graph.changeData(newData);
      }
    },
  },
  beforeDestroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  },
  methods: {
    initGraph() {
      const container = document.getElementById("g6-container");
      if (!container) return;

      const width = container.scrollWidth;
      const height = container.scrollHeight || 600;

      // 实例化 Tooltip 插件
      const tooltip = new G6.Tooltip({
        container: container, // 将 Tooltip 的容器指定为图表容器
        offsetX: 10,
        offsetY: 10,
        itemTypes: ['edge'], // 只对边生效
        // 自定义 Tooltip 内容
        getContent(e) {
          const out = document.createElement('div');
          out.style.width = 'fit-content';
          const model = e.item.getModel();
          out.innerHTML = `
            <ul>
              <li>Source: ${model.source}</li>
              <li>Target: ${model.target}</li>
            </ul>`;
          return out;
        },
      });

      this.graph = new G6.Graph({
        container: container,
        width,
        height,
        // 将 Tooltip 插件加入到 Graph 中
        plugins: [tooltip],
        // 布局
        layout: {
          type: 'concentric',
          preventOverlap: true,
          nodeSize: 100,
          minNodeSpacing: 80, // 节点之间的最小间距，增大以拉开距离
        },
        // 交互模式
        modes: {
          default: ["drag-canvas", "zoom-canvas", "drag-node"],
        },
        // 默认节点样式
        defaultNode: {
          size: 30,
          style: {
            lineWidth: 0,
            fill: "#1890FF",
          },
        },
        // 默认边样式
        defaultEdge: {
          style: {
            lineWidth: 1,
            stroke: '#666', // 深灰色线条
            lineAppendWidth: 10, // 增加边的拾取范围，便于触发鼠标事件
            endArrow: {
              path: "M 0,0 L 8,4 L 8,-4 Z",
              fill: '#666', // 深灰色箭头
            },
          },
        },
        // 节点状态样式
        nodeStateStyles: {
          hover: {
            cursor: 'pointer', // 鼠标指针变为小手
          },
        },
        // 边状态样式
        edgeStateStyles: {
          hover: {
            cursor: 'pointer', // 鼠标指针变为小手
          },
        },
      });

      // 绑定事件
      this.bindEvents();

      // 加载数据并渲染
      this.graph.data(this.graphData);
      this.graph.render();

      // 渲染后让容器可见
      container.style.opacity = 1;
    },

    bindEvents() {
      // 点击节点
      this.graph.on("node:click", (evt) => {
        const { item } = evt;
        const model = item.getModel();
        this.selectedNode = {
          id: model.id,
          properties: model.properties || { label: model.label || model.id },
        };
        this.isModalVisible = true;
      });

      // 鼠标进入节点
      this.graph.on("node:mouseenter", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", true);
      });

      // 鼠标离开节点
      this.graph.on("node:mouseleave", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", false);
      });

      // 鼠标进入边
      this.graph.on("edge:mouseenter", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", true);
      });

      // 鼠标离开边
      this.graph.on("edge:mouseleave", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", false);
      });
    },

    closeModal() {
      this.isModalVisible = false;
    },
  },
};
</script>
<style scoped>
#g6-container {
  width: 100%;
  height: 600px;
  border: 1px solid #ccc;
  position: relative;
  opacity: 0; /* 初始时透明 */
  transition: opacity 0.5s; /* 过渡动画 */
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  min-width: 300px;
}

.modal-content h3 {
  margin-top: 0;
}

.modal-content button {
  margin-top: 15px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
