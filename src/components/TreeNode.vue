<template>
  <div
    class="tree-node"
    :style="{ paddingLeft: source.level * 20 + 'px' }"
    @click.stop="toggle"
  >
    <i
      :class="[
        'node-arrow',
        source.expanded ? 'expanded' : '',
        source.isLeaf ? 'is-leaf' : '',
      ]"
      @click.stop="toggle"
    ></i>

    <el-checkbox
      :value="isSelected"
      :indeterminate="isChildIndeterminate"
      class="node-checkbox"
      @change="handleCheck"
      @click.native.stop
    >
      <span class="node-label">{{ source.label }}</span>
    </el-checkbox>
  </div>
</template>

<script>
import ElCheckbox from "element-ui/lib/checkbox";

export default {
  name: "TreeNode",
  components: {
    ElCheckbox,
  },
  props: {
    linked: {
      type: Boolean,
      required: true,
    },
    // 来自 virtual-list 的节点数据
    source: {
      type: Object,
      required: true,
    },
    // 全局的 selection Set
    selection: {
      type: Set,
      required: true,
    },
    // 包含所有原始节点的 Map
    originalNodeMasterMap: {
      type: Object,
      required: true,
    },
    // 用于切换展开/折叠状态的处理器
    toggleNode: {
      type: Function,
      required: true,
    },
    // 用于处理复选框变化的处理器
    handleCheckChange: {
      type: Function,
      required: true,
    },
  },
  computed: {
    isSelected() {
      return this.selection.has(this.source.nodeId);
    },
    isChildIndeterminate() {
      if (!this.linked) return false;
      if (this.isSelected || this.source.isLeaf) return false;

      const descendants = this.getDescendants(this.source);
      if (descendants.length === 0) return false;

      const selectedCount = descendants.filter((d) =>
        this.selection.has(d.nodeId)
      ).length;
      
      // 如果一个父节点的子节点中，只有部分被选中（而不是全部或零个），则该父节点处于半选状态。
      // 这也隐式地处理了部分子节点被选中，而其他子节点自身也处于半选状态的情况。
      const allDescendantsSelected = selectedCount === descendants.length;
      
      return selectedCount > 0 && !allDescendantsSelected;
    },
  },
  methods: {
    toggle() {
      if (!this.source.isLeaf) {
        this.toggleNode(this.source);
      }
    },
    handleCheck(checked) {
      this.handleCheckChange(this.source, checked);
    },
    // 此方法现在使用 master map 来正确查找所有后代节点
    getDescendants(startNode) {
      const descendants = [];
      const queue = [...(startNode.childrenIds || [])];
        
      while (queue.length > 0) {
        const childId = queue.shift();
        const childNode = this.originalNodeMasterMap[childId];
        if (childNode) {
          descendants.push(childNode);
          if (childNode.childrenIds && childNode.childrenIds.length > 0) {
            queue.push(...childNode.childrenIds);
          }
        }
      }
      return descendants;
    },
  },
};
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  padding: 0 5px;
}
.tree-node:hover {
  background-color: #f5f7fa;
}
.node-arrow {
  display: inline-block;
  width: 0; /* Use border to draw triangle */
  height: 0; /* Use border to draw triangle */
  border-top: 4px solid transparent; /* Top transparent border */
  border-bottom: 4px solid transparent; /* Bottom transparent border */
  border-left: 5px solid #606266; /* Left border to form right-pointing triangle */
  margin-right: 5px;
  flex-shrink: 0;
  transform: rotate(0deg);
  transition: transform 0.2s ease-in-out;
}
.node-arrow.expanded {
  transform: rotate(90deg);
}
.node-arrow.is-leaf {
  background-image: none;
  cursor: default;
  border-left: 5px solid transparent; /* Make it invisible */
}
.node-checkbox {
  display: flex;
  align-items: center;
}
.node-label {
  font-size: 14px;
}
/* Align checkbox with Element UI's tree component */
::v-deep .el-checkbox__input {
  vertical-align: middle;
}
</style>