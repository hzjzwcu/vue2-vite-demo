<template>
  <el-select
    :value="selectedNodesForTags"
    multiple
    filterable
    clearable
    collapse-tags
    :filter-method="filterMethod"
    placeholder="请选择"
    class="select-tree"
    popper-class="select-tree-popper"
    @remove-tag="handleRemoveTag"
    @clear="handleClear"
    @visible-change="handleVisibleChange"
  >
    <!-- 
      这个组件的核心实现方式：
      1. el-select 的 value 绑定的是一个标签字符串数组，这样 el-select 就能直接显示标签。
      2. 下拉框的内容现在被放置在 el-select 的 empty 插槽中。
      3. 真正的树组件 <virtual-tree> 被放在这个 empty 插槽中。
      4. 通过 CSS 修改 el-select 的下拉框样式，使其高度固定，并禁用其自身的滚动条，
         让内部的 virtual-tree 的滚动条成为唯一的滚动条。
    -->

    <!-- 使用 empty 插槽作为 virtual-tree 组件的容器 -->
    <template #empty>
      <div
        v-loading="isLoading"
        element-loading-text="正在计算节点状态..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        class="loading-container"
      >
        <virtual-tree
          ref="virtualTree"
          v-model="selection"
          :data="filteredTreeData"
          :props="treeProps"
          :linked="linked"
          class="select-tree-content"
        />
      </div>
    </template>
  </el-select>
</template>

<script>
import VirtualTree from "./VirtualTree.vue";
import ElSelect from "element-ui/lib/select";

export default {
  name: "SelectTree",
  model: {
    prop: "value", // 用于 v-model 双向绑定的 prop 名称
    event: "input", // 用于 v-model 双向绑定的事件名称
  },
  components: {
    VirtualTree,
    ElSelect,
  },
  props: {
    // 用于 v-model 双向绑定
    value: {
      type: Array,
      default: () => [],
    },
    // The original tree data
    data: {
      type: Array,
      required: true,
    },
    // The keys for id, label, and children in the tree data
    treeProps: {
      type: Object,
      default: () => ({
        id: "instId",
        label: "instAttrName",
        children: "children",
      }),
    },
    // Receives a 'linked' prop from the parent component
    linked: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      // 核心状态：存储所有选中节点的 ID (Set 结构保证唯一性)，从 v-model prop 初始化
      selection: new Set(this.value),
      // Search query string from the input box
      searchQuery: "",
      // A map from ID to the full node object for quick lookups
      idToNodeMap: {},
      // State to determine if the dropdown is visible
      dropdownVisible: false,
      // New: for controlling the loading state
      isLoading: false,
      // A flag to prevent infinite loops in the v-model implementation
      isInternalChange: false,
    };
  },
  computed: {
    /**
     * @description 计算出要显示在 el-select 标签中的文本数组
     * 根据用户的最终解决方案：el-select 的 value 直接是一个标签文本的数组。
     * @returns {string[]} - 例如: ['机构 0 1', '机构 0 2']
     */
    selectedNodesForTags() {
      const tags = [];
      const labelKey = this.treeProps.label;

      this.selection.forEach((id) => {
        if (this.idToNodeMap[id]) {
          const originalNode = this.idToNodeMap[id];
          tags.push(originalNode[labelKey]);
        }
      });
      return tags;
    },
    /**
     * @description 根据搜索查询字符串，计算出要传递给 virtual-tree 的过滤后的树形数据
     * @returns {Array} - 过滤后的树形数据
     */
    filteredTreeData() {
      if (!this.searchQuery) {
        return this.data;
      }
      const traverse = (nodes) => {
        const result = [];
        for (const node of nodes) {
          const childrenProp = this.treeProps.children;
          let children = [];
          if (node[childrenProp]) {
            children = traverse(node[childrenProp]);
          }

          const labelProp = this.treeProps.label;
          if (
            node[labelProp]
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()) ||
            children.length > 0
          ) {
            const newNode = { ...node, [childrenProp]: children };
            result.push(newNode);
          }
        }
        return result;
      };
      return traverse(this.data);
    },
    // 将 Set 转换为数组，方便取用
    selectedIds() {
      return [...this.selection];
    },
  },
  watch: {
    // 监视来自父组件的 value prop 的变化 (外部到内部)
    value: {
      handler(newVal) {
        // 如果是内部变更触发的，则重置标志位并忽略此次更新，以中断循环
        if (this.isInternalChange) {
          this.isInternalChange = false;
          return;
        }
        // 否则，视为外部变更，用新值更新内部的 selection
        this.selection = new Set(newVal);
      },
      deep: true,
    },

    // 监视原始树数据的变化，以重建 ID 到节点的映射
    data: {
      handler(newData) {
        this.buildIdToNodeMap(newData);
      },
      immediate: true,
    },

    // 监视内部 selection 的变化 (内部到外部)
    selection: {
      handler(newSelection) {
        // 在触发 input 事件前，设置标志位，表明这是一个内部变更
        this.isInternalChange = true;
        // 向外触发 input 事件，更新父组件的 v-model
        this.$emit("input", [...newSelection]);
      },
      deep: true,
    },
  },
  methods: {
    // 构建 ID 到完整节点对象的映射，用于快速查找
    buildIdToNodeMap(nodes) {
      const map = {};
      const idKey = this.treeProps.id;
      const childrenKey = this.treeProps.children;

      const traverse = (nodesToScan) => {
        for (const node of nodesToScan) {
          map[node[idKey]] = node;
          const children = node[childrenKey];
          if (children) {
            traverse(children);
          }
        }
      };
      traverse(nodes);
      this.idToNodeMap = map;
    },
    /**
     * @description el-select 的 filter-method，当用户输入时触发
     * @param {string} query - 当前输入框的值
     */
    filterMethod(query) {
      // 这是一个启发式方法：如果查询变为空，但下拉框仍然可见，
      // 我们就假设这是 el-select 在选中后自动清空了输入框，此时我们忽略这次更新，保持筛选条件不变。
      if (query === "" && this.dropdownVisible) {
        return;
      }
      this.searchQuery = query;
    },
    /**
     * @description 当移除一个 el-select 标签时触发
     * @param {string} removedLabel - 被移除标签的文本
     */
    handleRemoveTag(removedLabel) {
      let idToRemove = null;
      const labelKey = this.treeProps.label;

      // 关键逻辑：根据标签文本反向查找对应的节点 ID
      // 这里只遍历当前已选中的节点，效率较高
      for (const id of this.selection) {
        if (
          this.idToNodeMap[id] &&
          this.idToNodeMap[id][labelKey] === removedLabel
        ) {
          idToRemove = id;
          break;
        }
      }

      if (idToRemove) {
        // 调用子组件的公共方法来执行完整的、包含父子联动的取消选择操作
        this.$refs.virtualTree.deselectNodeAndChildren(idToRemove);
      }
    },
    // 当点击 el-select 的清除图标时触发
    handleClear() {
      this.selection = new Set();
    },
    /**
     * @description 当下拉框的可见性改变时触发 (异步加载版本)
     * @param {boolean} isVisible - 下拉框是否可见
     */
    handleVisibleChange(isVisible) {
      this.dropdownVisible = isVisible;
      if (isVisible) {
        // --- OPENING ---
        this.isLoading = true;
        // 使用 setTimeout 让 loading 指示器有机会渲染
        setTimeout(() => {
          this.$nextTick(() => {
            if (this.$refs.virtualTree) {
              // 指示树组件恢复其滚动位置和展开状态
              this.$refs.virtualTree.restoreState();
            }
            this.isLoading = false;
          });
        }, 50);
      } else {
        // --- CLOSING ---
        // 重置搜索查询
        this.searchQuery = ""; 
        // 保存滚动位置和展开状态
        if (this.$refs.virtualTree) {
          this.$refs.virtualTree.saveState();
        }
      }
    },
  },
};
</script>

<style>
/* === 最终的样式修复方案 === */

/* 1. 为下拉框提供一个固定的高度，并强制禁用其自身的滚动条 */
.select-tree-popper .el-select-dropdown__wrap {
  max-height: 500px;
  overflow: hidden !important; /* 强制禁用外层滚动条，这是解决双滚动条问题的关键 */
}

/* 2. 让作为容器的 empty 插槽适应其内容，并移除其自身可能带来的滚动问题 */
.select-tree-popper .el-select-dropdown__empty {
  padding: 0;
  height: 100%; /* 让 empty 插槽填充可用高度 */
  /* 移除 height 和 overflow, 让其包裹内容 */
}

/* 3. 为 virtual-tree 组件本身设置固定高度，使其内部滚动 */
.select-tree-popper .select-tree-content {
  height: 100%;
}

/* 4. 新增：为 v-loading 的容器设置高度 */
.select-tree-popper .loading-container {
  height: 500px;
}
</style>
