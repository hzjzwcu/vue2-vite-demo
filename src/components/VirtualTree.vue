<template>
  <div class="virtual-tree-container">
    <div class="virtual-tree-header">
      <el-checkbox
        :value="isAllSelected"
        :indeterminate="isIndeterminate"
        @change="handleSelectAll"
      >
        全选
      </el-checkbox>
    </div>
    <virtual-list
      ref="virtualList"
      class="virtual-list"
      :data-key="dataKey"
      :data-sources="visibleNodes"
      :data-component="itemComponent"
      :estimate-size="32"
      :extra-props="extraProps"
    />
  </div>
</template>

<script>
import VirtualList from 'vue-virtual-scroll-list';
import ElCheckbox from 'element-ui/lib/checkbox';
import TreeNode from './TreeNode.vue'; // 引入树节点子组件

let id = 0;

export default {
  name: 'VirtualTree',
  components: {
    VirtualList,
    ElCheckbox,
  },
  props: {
    // 原始树形数据
    data: {
      type: Array,
      required: true,
    },
    // 通过 v-model 接收和管理选中项的 Set
    value: {
      type: Set,
      default: () => new Set(),
    },
    // 用于映射用户数据到组件内部使用的键名
    props: {
      type: Object,
      default: () => ({
        id: 'instId',
        label: 'instAttrName',
        children: 'children',
      }),
    },
    // 新增：控制是否父子联动
    linked: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      itemComponent: TreeNode,
      // 存储所有节点“拍平”后的一维数组
      flattenedNodes: [],
      // 存储当前可见的节点（根据展开/折叠状态）
      visibleNodes: [],
    };
  },
  computed: {
    // v-model 的实现: 这是一个计算属性的 getter/setter
    // get: 读取父组件传入的 value
    // set: 当内部选中值变化时，通过 $emit('input', ...) 通知父组件更新
    internalSelection: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit('input', newVal);
      },
    },
    // 为 vue-virtual-scroll-list 提供唯一的 key
    dataKey() {
      return 'id'; 
    },
    // 需要传递给每个 TreeNode 子组件的额外属性
    extraProps() {
      return {
        flattenedNodes: this.flattenedNodes,
        selection: this.internalSelection,
        toggleNode: this.toggleNode,
        handleCheckChange: this.handleCheckChange,
      };
    },
    // “全选”复选框是否被选中
    isAllSelected() {
      if (!this.flattenedNodes.length) return false;
      return this.internalSelection.size === this.flattenedNodes.length;
    },
    // “全选”复选框是否处于半选状态
    isIndeterminate() {
      if (!this.flattenedNodes.length) return false;
      // 在非关联模式下，半选状态没有意义，可以直接返回 false
      if (!this.linked) {
        if (this.internalSelection.size === 0 || this.internalSelection.size === this.flattenedNodes.length) {
          return false;
        }
        return true;
      }
      return (
        this.internalSelection.size > 0 &&
        this.internalSelection.size < this.flattenedNodes.length
      );
    },
  },
  watch: {
    // 当原始数据 data 变化时，重新初始化所有节点
    data: {
      handler(newData) {
        this.initializeNodes(newData);
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * @description 初始化节点数据
     * 核心逻辑：深度优先遍历原始树形数据，将其“拍平”为一个一维数组。
     * 数组中的每个节点都会被赋予唯一的内部id、层级、父节点引用等额外信息。
     * @param {Array} treeData - 原始树形数据
     */
    initializeNodes(treeData) {
      const flattened = [];
      id = 0;

      const traverse = (nodes, level = 0, parent = null) => {
        if (!nodes) return;
        nodes.forEach(node => {
          const nodeId = node[this.props.id];
          const internalNode = {
            id: `tree-node-${id++}`, // 用于 virtual-list 的唯一 key
            nodeId: nodeId,          // 节点自身的ID
            label: node[this.props.label],
            level,
            expanded: true, // 默认全部展开
            visible: true,
            parent,
            childrenIds: (node[this.props.children] || []).map(
              child => child[this.props.id]
            ),
            isLeaf: !(
              node[this.props.children] && node[this.props.children].length > 0
            ),
          };
          flattened.push(internalNode);

          traverse(node[this.props.children], level + 1, internalNode);
        });
      };

      traverse(treeData);
      this.flattenedNodes = flattened;
      this.updateVisibleNodes();
    },

    // 切换节点的展开/折叠状态
    toggleNode(node) {
      node.expanded = !node.expanded;
      this.updateVisibleNodes();
      // 更新可见节点后，需要调用 reset() 来强制虚拟列表重新计算滚动高度
      this.$nextTick(() => {
        if (this.$refs.virtualList) {
          this.$refs.virtualList.reset();
        }
      });
    },

    // 根据所有节点的 expanded 状态，计算出 visibleNodes 数组
    updateVisibleNodes() {
      this.visibleNodes = this.flattenedNodes.filter(n => {
        if (!n.parent) return true; // 根节点总是可见的

        let parent = n.parent;
        while (parent) {
          if (!parent.expanded) return false; // 如果任何一个祖先节点是折叠的，则该节点不可见
          parent = parent.parent;
        }
        return true;
      });
    },

    /**
     * @description 处理单个节点的勾选状态变化，这是最核心的联动逻辑
     * @param {object} node - 被操作的节点
     * @param {boolean} checked - 勾选状态
     */
    handleCheckChange(node, checked) {
      const newSelection = new Set(this.internalSelection);

      if (this.linked) {
        // --- 关联模式 ---
        // 1. 更新自身和所有后代节点
        const nodesToUpdate = [node, ...this.getDescendants(node)];
        nodesToUpdate.forEach(n => {
          if (checked) {
            newSelection.add(n.nodeId);
          } else {
            newSelection.delete(n.nodeId);
          }
        });

        // 2. 向上更新所有祖先节点的状态
        let parent = node.parent;
        while (parent) {
          // 找到所有兄弟节点
          const children = this.flattenedNodes.filter(
            n => n.parent && n.parent.nodeId === parent.nodeId
          );
          // 判断是否所有兄弟节点都被选中
          const allChildrenSelected = children.every(child =>
            newSelection.has(child.nodeId)
          );

          if (allChildrenSelected) {
            // 如果所有兄弟都选中了，则父节点也应被选中
            newSelection.add(parent.nodeId);
          } else {
            // 否则，父节点不应被选中
            newSelection.delete(parent.nodeId);
          }
          parent = parent.parent;
        }
      } else {
        // --- 非关联模式 ---
        // 只更新当前点击的节点
        if (checked) {
          newSelection.add(node.nodeId);
        } else {
          newSelection.delete(node.nodeId);
        }
      }
      
      // 触发 v-model 更新
      this.internalSelection = newSelection;
    },

    // 递归获取一个节点的所有后代节点
    getDescendants(startNode) {
      const descendants = [];
      const queue = [...(startNode.childrenIds || [])];
      // 创建一个ID到节点的映射，用于快速查找
      const allNodesById = this.flattenedNodes.reduce((acc, n) => {
        acc[n.nodeId] = n;
        return acc;
      }, {});

      while (queue.length > 0) {
        const childId = queue.shift();
        const childNode = allNodesById[childId];
        if (childNode) {
          descendants.push(childNode);
          if (childNode.childrenIds) {
            queue.push(...childNode.childrenIds);
          }
        }
      }
      return descendants;
    },

    // Public method for parent component to call
    deselectNodeAndChildren(nodeId) {
      const nodeToDeselect = this.flattenedNodes.find(n => n.nodeId === nodeId);
      if (nodeToDeselect) {
        this.handleCheckChange(nodeToDeselect, false);
      }
    },

    /**
     * @description 公共方法：滚动到指定的节点
     * @param {string} nodeId - 要滚动到的节点ID
     */
    scrollToNode(nodeId) {
      const index = this.visibleNodes.findIndex(node => node.nodeId === nodeId);
      if (index !== -1 && this.$refs.virtualList) {
        // 调用 vue-virtual-scroll-list 的内置方法
        this.$refs.virtualList.scrollToIndex(index);
      }
    },

    /**
     * @description 公共方法：折叠所有节点，然后只展开选中节点的祖先路径
     */
    collapseAllAndExpandSelected() {
      const nodesToExpand = new Set();
      // 遍历所有选中项，将其所有祖先节点标记为需要展开
      this.internalSelection.forEach(selectedId => {
          let currentNode = this.flattenedNodes.find(n => n.nodeId === selectedId);
          if (currentNode) {
              let parent = currentNode.parent;
              while(parent) {
                  nodesToExpand.add(parent);
                  parent = parent.parent;
              }
          }
      });

      // 根据标记设置每个节点的展开状态
      this.flattenedNodes.forEach(node => {
          // 在非关联模式下，总是展开所有节点
          node.expanded = !this.linked || nodesToExpand.has(node);
      });

      // 更新可见节点列表
      this.updateVisibleNodes();

      // 重置虚拟列表以应用UI更新
      if (this.$refs.virtualList) {
          this.$refs.virtualList.reset();
      }
    },
    
    // “全选”复选框的处理器
    handleSelectAll(checked) {
      if (checked) {
        const allIds = new Set(this.flattenedNodes.map(n => n.nodeId));
        this.internalSelection = allIds;
      } else {
        this.internalSelection = new Set();
      }
    },
  },
};
</script>

<style scoped>
.virtual-tree-container {
  /* 移除边框和圆角 */
  /* Re-implement Flexbox layout to fill parent height */
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.virtual-tree-header {
  padding: 10px;
  /* 移除背景色 */
  border-bottom: 1px dashed #dcdfe6; /* 将下边框改为虚线 */
  /* Prevent header from shrinking */
  flex-shrink: 0;
}
.virtual-list {
  /* Allow list to take up all remaining space */
  flex-grow: 1;
  overflow-y: auto;
  /* Fixed height is removed, height is now determined by flexbox */
}
</style>