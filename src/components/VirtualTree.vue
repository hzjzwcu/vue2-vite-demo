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
      @mousedown.native="handleMouseDown"
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
    // 原始树形数据（可能被筛选）
    data: {
      type: Array,
      required: true,
    },
    // 完整的、未被筛选的原始树形数据
    originalData: {
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
      // 新增：一个包含 *所有* 原始节点信息的 Master Map
      originalNodeMasterMap: {},
      // 用于保存滚动位置
      savedScrollOffset: 0,
    };
  },
  computed: {
    // v-model 的实现: 这是一个计算属性的 getter/setter
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
        selection: this.internalSelection,
        toggleNode: this.toggleNode,
        handleCheckChange: this.handleCheckChange,
        linked: this.linked,
        // 将 Master Map 传递给子节点
        originalNodeMasterMap: this.originalNodeMasterMap,
      };
    },
    // --- 新的全选/半选状态计算 ---
    // “全选”复选框是否被选中（现在基于所有原始节点）
    isAllSelected() {
      const allNodeIds = Object.keys(this.originalNodeMasterMap);
      if (!allNodeIds.length) return false;
      // 检查是否所有原始节点都已被选中
      return allNodeIds.every(nodeId => this.internalSelection.has(nodeId));
    },
    // “全选”复选框是否处于半选状态（现在基于所有原始节点）
    isIndeterminate() {
      const allNodeIds = Object.keys(this.originalNodeMasterMap);
      if (!allNodeIds.length) return false;
      const selectionSize = this.internalSelection.size;
      // 如果有选中项，但又没有全部选中，则为半选状态
      return selectionSize > 0 && selectionSize < allNodeIds.length;
    },
  },
  watch: {
    // 当（可能被筛选的）树数据 data 变化时，重新初始化显示的节点
    data: {
      handler(newData) {
        // 确保 master map 已经构建完毕，否则 initializeNodes 会失败
        if (Object.keys(this.originalNodeMasterMap).length > 0) {
          this.initializeNodes(newData);
        }
      },
      immediate: true,
    },
    // 当完整的原始数据 originalData 变化时，构建 Master Map 并初始化节点
    originalData: {
      handler(newData) {
        this.buildOriginalNodeMasterMap(newData);
        // 构建完 map 后，必须用当前的 data prop 来初始化节点，
        // 因为 data 的 watcher 可能在 map 构建前被跳过了。
        this.initializeNodes(this.data);
      },
      immediate: true,
    },
  },
  methods: {
    // 新增：处理鼠标在列表上按下的事件
    handleMouseDown() {
      this.$emit('selection-in-progress');
    },
    /**
     * @description 构建包含所有原始节点完整信息的 Master Map
     */
    buildOriginalNodeMasterMap(treeData) {
      const map = {};
      let internalId = 0;
      const idKey = this.props.id;
      const childrenKey = this.props.children;
      const labelKey = this.props.label;

      const traverse = (nodes, level = 0, parent = null) => {
        if (!nodes) return;
        nodes.forEach(node => {
          const nodeId = node[idKey];
          const children = node[childrenKey] || [];
          const internalNode = {
            id: `tree-node-${internalId++}`,
            nodeId: nodeId,
            label: node[labelKey],
            level,
            expanded: false,
            visible: true,
            parent,
            childrenIds: children.map(child => child[idKey]),
            isLeaf: children.length === 0,
          };
          map[nodeId] = internalNode;
          // 递归构建父节点引用
          const parentNode = parent ? map[parent.nodeId] : null;
          internalNode.parent = parentNode;

          traverse(children, level + 1, internalNode);
        });
      };
      traverse(treeData);
      this.originalNodeMasterMap = map;
    },

    /**
     * @description 初始化节点数据（基于当前传入的 data, 可能被筛选）
     */
    initializeNodes(treeData) {
      const flattened = [];
      const idKey = this.props.id;
      
      const traverse = (nodes) => {
        if (!nodes) return;
        nodes.forEach(node => {
          const nodeId = node[idKey];
          // 从 master map 中获取完整的节点信息
          const masterNode = this.originalNodeMasterMap[nodeId];
          if (masterNode) {
            flattened.push(masterNode);
            traverse(node[this.props.children]);
          }
        });
      };

      traverse(treeData);
      this.flattenedNodes = flattened;
      this.updateVisibleNodes();
    },

    // 切换节点的展开/折叠状态
    toggleNode(node) {
      // 在 master map 中更新状态
      const masterNode = this.originalNodeMasterMap[node.nodeId];
      if (masterNode) {
        masterNode.expanded = !masterNode.expanded;
      }
      this.updateVisibleNodes();
    },

    // 根据所有节点的 expanded 状态，计算出 visibleNodes 数组
    updateVisibleNodes() {
      this.visibleNodes = this.flattenedNodes.filter(n => {
        let parent = n.parent;
        while (parent) {
          // 从 master map 读取展开状态
          const masterParent = this.originalNodeMasterMap[parent.nodeId];
          if (!masterParent || !masterParent.expanded) return false;
          parent = masterParent.parent;
        }
        return true;
      });
    },

    /**
     * @description 处理单个节点的勾选状态变化
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
        let parent = this.originalNodeMasterMap[node.nodeId]?.parent;
        while (parent) {
          const originalChildrenIds = parent.childrenIds || [];
          
          if (originalChildrenIds.length > 0) {
            const allOriginalChildrenSelected = originalChildrenIds.every(childId =>
              newSelection.has(childId)
            );

            if (allOriginalChildrenSelected) {
              newSelection.add(parent.nodeId);
            } else {
              newSelection.delete(parent.nodeId);
            }
          }
          parent = parent.parent;
        }
      } else {
        // --- 非关联模式 ---
        if (checked) {
          newSelection.add(node.nodeId);
        } else {
          newSelection.delete(node.nodeId);
        }
      }
      this.internalSelection = newSelection;
    },

    // 递归获取一个节点的所有后代节点 (使用 master map)
    getDescendants(startNode) {
      const descendants = [];
      const queue = [...(startNode.childrenIds || [])];

      while (queue.length > 0) {
        const childId = queue.shift();
        const childNode = this.originalNodeMasterMap[childId];
        if (childNode) {
          descendants.push(childNode);
          if (childNode.childrenIds) {
            queue.push(...childNode.childrenIds);
          }
        }
      }
      return descendants;
    },

    // 父组件调用的公共方法
    deselectNodeAndChildren(nodeId) {
      const nodeToDeselect = this.originalNodeMasterMap[nodeId];
      if (nodeToDeselect) {
        this.handleCheckChange(nodeToDeselect, false);
      }
    },
    
    /**
     * @description “全选”复选框的处理器 (现在基于所有原始节点)
     * @param {boolean} checked - 是否选中
     */
    handleSelectAll(checked) {
      if (checked) {
        // 全选：将所有原始节点的 ID 添加到 selection 中
        const allNodeIds = Object.keys(this.originalNodeMasterMap);
        this.internalSelection = new Set(allNodeIds);
      } else {
        // 全不选：清空 selection
        this.internalSelection = new Set();
      }
    },

    // === 状态保存与恢复 ===
    saveState() {
      if (this.$refs.virtualList) {
        this.savedScrollOffset = this.$refs.virtualList.getOffset();
      }
    },
    restoreState() {
      this.updateVisibleNodes();
      this.$nextTick(() => {
        const virtualList = this.$refs.virtualList;
        if (virtualList) {
          virtualList.reset();
          this.$nextTick(() => {
            virtualList.scrollToOffset(this.savedScrollOffset);
          });
        }
      });
    },

    // === 重置树的状态 ===
    resetTreeState() {
      // 重置 master map 中的展开状态
      Object.values(this.originalNodeMasterMap).forEach(node => {
        node.expanded = false;
      });
      this.updateVisibleNodes();
      this.$nextTick(() => {
        if (this.$refs.virtualList) {
          this.$refs.virtualList.scrollToOffset(0);
        }
      });
    },
  },
};
</script>

<style scoped>
.virtual-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}
.virtual-tree-header {
  padding: 10px;
  border-bottom: 1px dashed #dcdfe6;
  flex-shrink: 0;
}
.virtual-list {
  flex-grow: 1;
  overflow-y: auto;
}
</style>