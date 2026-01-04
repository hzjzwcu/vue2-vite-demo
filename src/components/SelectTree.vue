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
      2. 下拉框的内容被一个单独的、不含任何内容的 el-option 包裹。
      3. 真正的树组件 <virtual-tree> 被放在这个 el-option 中。
      4. 通过 CSS 修改 el-select 的下拉框样式，使其高度固定，并禁用其自身的滚动条，
         让内部的 virtual-tree 的滚动条成为唯一的滚动条。
    -->

    <!-- 一个单独的 el-option，作为 virtual-tree 组件的容器 -->
    <el-option value="" class="tree-option-item">
      <virtual-tree
        ref="virtualTree"
        v-model="selection"
        :data="filteredTreeData"
        :props="treeProps"
      />
    </el-option>
  </el-select>
</template>

<script>
import VirtualTree from './VirtualTree.vue';
import ElSelect from 'element-ui/lib/select';
import ElOption from 'element-ui/lib/option';

export default {
  name: 'SelectTree',
  components: {
    VirtualTree,
    ElSelect,
    ElOption,
  },
  props: {
    // 原始树形数据
    data: {
      type: Array,
      required: true,
    },
    // 树形数据中，id、label、children对应的键名
    treeProps: {
      type: Object,
      default: () => ({
        id: 'instId',
        label: 'instAttrName',
        children: 'children',
      }),
    },
  },
  data() {
    return {
      // 核心状态：存储所有选中节点的 ID (Set 结构保证唯一性)
      selection: new Set(),
      // 搜索框中的查询字符串
      searchQuery: '',
      // 一个从 ID 到完整节点对象的映射，用于快速查找
      idToNodeMap: {},
      // 用于判断下拉框是否可见的状态
      dropdownVisible: false,
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

      this.selection.forEach(id => {
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
            node[labelProp].toLowerCase().includes(this.searchQuery.toLowerCase()) ||
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
    // 当原始数据 data 变化时，重新构建 ID 到节点的映射
    data: {
      handler(newData) {
        this.buildIdToNodeMap(newData);
      },
      immediate: true,
    },
    // 侦听选中项的变化，并打印到控制台
    selection: {
      handler(newSelection) {
        console.log('当前选中的节点ID:', [...newSelection]);
      },
      deep: true
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
      if (query === '' && this.dropdownVisible) {
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
        if (this.idToNodeMap[id] && this.idToNodeMap[id][labelKey] === removedLabel) {
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
     * @description 当下拉框的可见性改变时触发
     * @param {boolean} isVisible - 下拉框是否可见
     */
    handleVisibleChange(isVisible) {
      this.dropdownVisible = isVisible;
      if (isVisible) {
        // 使用 $nextTick 确保 DOM 更新完毕
        this.$nextTick(() => {
          if (this.$refs.virtualTree) {
            // 1. 折叠所有节点，并展开选中节点的路径。此方法内部会重置列表。
            this.$refs.virtualTree.collapseAllAndExpandSelected();

            // 2. 在下一个 tick 中执行滚动，确保列表已根据新的展开状态重新渲染
            this.$nextTick(() => {
              if (this.selection.size > 0 && this.selectedIds) {
                const firstSelectedId = this.selectedIds[0];
                if (this.$refs.virtualTree && firstSelectedId) {
                  this.$refs.virtualTree.scrollToNode(firstSelectedId);
                }
              }
            });
          }
        });
      } else {
        // 当下拉框关闭时，重置搜索查询
        this.searchQuery = '';
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

/* 2. 让作为容器的 el-option 占满整个下拉框的高度 */
.tree-option-item {
  height: 500px;
  padding: 0;
  overflow: hidden; /* 自身也不滚动 */
  background-color: #fff !important; /* 覆盖 el-option 的 hover 效果 */
}
.tree-option-item.hover {
  background-color: #fff;
}

/* 3. 当搜索时，el-select 会为这个容器 option 添加 .filtered 类，此时应将其隐藏，避免干扰 */
.el-select-dropdown__list .tree-option-item.filtered {
    display: none;
}
</style>
