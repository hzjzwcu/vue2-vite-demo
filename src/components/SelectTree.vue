<template>
  <div class="select-tree-container">
    <el-select
      :value="value"
      multiple
      filterable
      placeholder="请选择"
      style="width: 100%;"
      popper-class="select-tree-popper"
      @remove-tag="removeTag"
      @clear="clearAll"
    >
      <template #empty>
        <div class="tree-wrapper">
          <div class="tree-header">
            <el-input
              v-model="filterText"
              placeholder="输入关键字进行过滤"
              size="mini"
              clearable
            ></el-input>
            <el-checkbox
              v-model="isSelectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
              style="margin-left: 10px;"
            >全选</el-checkbox>
          </div>
          <el-virtual-scroll-tree
            ref="tree"
            :data="data"
            :props="props"
            show-checkbox
            node-key="instId"
            :filter-node-method="filterNode"
            :default-checked-keys="value"
            @check="handleCheck"
          ></el-virtual-scroll-tree>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script>
import ElVirtualScrollTree from 'el-virtual-scroll-tree';

export default {
  name: 'SelectTree',
  components: {
    ElVirtualScrollTree,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    value: { // for v-model
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      props: {
        children: 'children',
        label: 'instAttrName',
      },
      filterText: '',
      isSelectAll: false,
      isIndeterminate: false,
      allNodeKeys: [],
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    value(newVal) {
      this.updateSelectAllState(newVal);
    },
    data: {
        immediate: true,
        handler(val) {
            if(val && val.length > 0) {
                this.$nextTick(() => {
                    this.allNodeKeys = this.getAllKeys(val);
                    this.updateSelectAllState(this.value);
                });
            }
        }
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.instAttrName.toLowerCase().includes(value.toLowerCase());
    },
    handleCheck(checkedNode, checkedStatus) {
      this.$emit('input', checkedStatus.checkedKeys);
    },
    removeTag(tagKey) {
      const newKeys = this.value.filter(key => key !== tagKey);
      this.$emit('input', newKeys);
      this.$refs.tree.setCheckedKeys(newKeys);
    },
    clearAll() {
      this.$emit('input', []);
      this.$refs.tree.setCheckedKeys([]);
    },
    handleSelectAll(isAll) {
      if (isAll) {
        this.$emit('input', this.allNodeKeys);
        this.$refs.tree.setCheckedKeys(this.allNodeKeys);
      } else {
        this.clearAll();
      }
    },
    updateSelectAllState(selectedKeys) {
        if (!this.allNodeKeys || this.allNodeKeys.length === 0) {
            this.isSelectAll = false;
            this.isIndeterminate = false;
            return;
        }
        const allCount = this.allNodeKeys.length;
        const selectedCount = selectedKeys.length;

        if (selectedCount === 0) {
            this.isSelectAll = false;
            this.isIndeterminate = false;
        } else if (selectedCount === allCount) {
            this.isSelectAll = true;
            this.isIndeterminate = false;
        } else {
            this.isSelectAll = false;
            this.isIndeterminate = true;
        }
    },
    getAllKeys(nodes) {
      let keys = [];
      for (const node of nodes) {
        keys.push(node.instId);
        if (node.children) {
          keys = keys.concat(this.getAllKeys(node.children));
        }
      }
      return keys;
    }
  },
};
</script>

<style>
/* Use a custom popper class to override styles */
.select-tree-popper {
  padding: 0;
}

.tree-wrapper {
  padding: 10px;
}

.tree-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 10px;
}
.el-select-dropdown__empty {
    padding: 0;
}
</style>