<template>
  <div>
    <!-- 1. G6 渲染的容器 -->
    <div id="g6-container"></div>

    <!-- 2. 节点点击弹窗 -->
    <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>节点信息</h3>
        <p><strong>ID:</strong> {{ selectedNode.id }}</p>
        <p v-for="(value, key) in selectedNode.properties" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </p>
        <button @click="closeModal">关闭</button>
      </div>
    </div>
    
    <!-- 3. 自定义边 Tooltip -->
    <div 
      v-show="tooltip.visible" 
      :style="tooltip.style"
      class="custom-tooltip"
      v-html="tooltip.content"
    ></div>
  </div>
</template>

<script>
import G6 from "@antv/g6";

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
      tooltip: {
        visible: false,
        content: '',
        style: {
          left: '0px',
          top: '0px',
        },
      },
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

      this.graph = new G6.Graph({
        container: container,
        width,
        height,
        // 布局
        layout: {
          type: 'concentric',
          preventOverlap: true,
          nodeSize: 100,
          minNodeSpacing: 80,
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
            stroke: '#666',
            lineAppendWidth: 10,
            endArrow: {
              path: "M 0,0 L 8,4 L 8,-4 Z",
              fill: '#666',
            },
          },
        },
        // 节点状态样式
        nodeStateStyles: {
          hover: {
            cursor: 'pointer',
          },
        },
        // 边状态样式
        edgeStateStyles: {
          hover: {
            cursor: 'pointer',
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

      // 节点悬停事件
      this.graph.on("node:mouseenter", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", true);
      });
      this.graph.on("node:mouseleave", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", false);
      });

      // --- 自定义 Tooltip 的事件 ---
      this.graph.on("edge:mouseenter", (evt) => {
        const { item } = evt;
        const model = item.getModel();
        this.graph.setItemState(item, "hover", true);
        
        this.tooltip.visible = true;
        this.tooltip.content = `
          <ul>
            <li>Source: ${model.source}</li>
            <li>Target: ${model.target}</li>
          </ul>`;
        this.updateTooltipPosition(evt);
      });

      this.graph.on("edge:mousemove", (evt) => {
        this.updateTooltipPosition(evt);
      });
      
      this.graph.on("edge:mouseleave", (evt) => {
        const { item } = evt;
        this.graph.setItemState(item, "hover", false);
        this.tooltip.visible = false;
      });
    },

    updateTooltipPosition(evt) {
      const { clientX, clientY } = evt.originalEvent;
      this.tooltip.style = {
        left: `${clientX + 10}px`,
        top: `${clientY + 10}px`,
      };
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

/* 自定义 Tooltip 样式 */
.custom-tooltip {
  position: fixed;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  z-index: 1001;
  pointer-events: none; /* 防止 tooltip 本身捕获鼠标事件 */
  transition: opacity 0.2s;
}

/* 覆盖 tooltip 内容的默认 ul 样式 */
.custom-tooltip ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
