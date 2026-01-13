<template>
  <div class="demo-container">
    <h1>Element-UI 虚拟树选择器演示</h1>
    <p>
      这是一个封装了 `el-virtual-scroll-tree` 的可复用组件，用于解决大数据量下 `el-tree` 的性能问题。
    </p>
    <div style="width: 500px;">
      <select-tree v-model="selectedOrgIds" :data="treeData"></select-tree>
    </div>
    <div style="margin-top: 20px;">
      <h3>当前选中机构ID (v-model):</h3>
      <p>共选中 {{ selectedOrgIds.length }} 个</p>
      <div class="selected-keys-display">
        {{ selectedOrgIds }}
      </div>
    </div>
  </div>
</template>

<script>
import SelectTree from '../SelectTree.vue';

function generateTreeData(nodeCount, levelCount) {
  const tree = [];
  let idCounter = 0;

  function createChildren(parent, level) {
    if (level >= levelCount || idCounter >= nodeCount) {
      return [];
    }
    const childCount = Math.floor(Math.random() * 5) + 1;
    const children = [];
    for (let i = 0; i < childCount; i++) {
      if (idCounter >= nodeCount) break;
      
      const nodeId = ++idCounter;
      const newNode = {
        instId: `id_${nodeId}`,
        instAttrName: `机构 ${nodeId} (层级 ${level + 1})`,
        children: [],
      };

      if (level + 1 < levelCount && idCounter < nodeCount) {
         newNode.children = createChildren(newNode, level + 1);
      }
     
      children.push(newNode);
    }
    return children;
  }

  while (idCounter < nodeCount) {
    const nodeId = ++idCounter;
    const rootNode = {
      instId: `id_${nodeId}`,
      instAttrName: `机构 ${nodeId} (层级 1)`,
      children: [],
    };
    rootNode.children = createChildren(rootNode, 1);
    tree.push(rootNode);
  }

  return tree;
}


export default {
  name: 'LibTreeDemo',
  components: {
    SelectTree,
  },
  data() {
    console.log("正在生成5000个节点的模拟数据...");
    const treeData = generateTreeData(5000, 7);
    console.log("数据生成完毕。");
    
    return {
      treeData: treeData,
      selectedOrgIds: ['id_1', 'id_10'], // Initial selection
    };
  },
};
</script>

<style scoped>
.demo-container {
  padding: 20px;
}
.selected-keys-display {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  color: #606266;
  word-wrap: break-word;
}
</style>
