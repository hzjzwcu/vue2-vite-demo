<template>
  <div
    class="tree-node"
    :style="{ paddingLeft: source.level * 20 + 'px' }"
    @click.stop="toggle"
  >
    <i
      :class="['node-arrow', source.expanded ? 'expanded' : '', source.isLeaf ? 'is-leaf' : '']"
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
import ElCheckbox from 'element-ui/lib/checkbox';

export default {
  name: 'TreeNode',
  components: {
    ElCheckbox,
  },
  props: {
    // The node data from virtual-list
    source: {
      type: Object,
      required: true,
    },
    // The global selection Set
    selection: {
      type: Set,
      required: true,
    },
    // The full list of flattened nodes
    flattenedNodes: {
        type: Array,
        required: true,
    },
    // Handler for toggling expand/collapse
    toggleNode: {
      type: Function,
      required: true,
    },
    // Handler for checkbox changes
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
        if (this.isSelected || this.source.isLeaf) return false;

        const descendants = this.getDescendants(this.source);
        if (descendants.length === 0) return false;

        const selectedCount = descendants.filter(d => this.selection.has(d.nodeId)).length;
        return selectedCount > 0 && selectedCount < descendants.length;
    }
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
    getDescendants(startNode) {
      const descendants = [];
      const queue = [...(startNode.childrenIds || [])];
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