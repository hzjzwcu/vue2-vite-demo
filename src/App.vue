<template>
  <div id="app">
    <h1>高性能虚拟树选择器 (Select Tree)</h1>
    <p>
      此示例展示了一个内嵌 <strong>{{ nodeCount.toLocaleString() }}</strong> 个节点 (7层) 树的 Select 组件。
    </p>
    <p>它使用 <code>vue-virtual-scroll-list</code> 实现虚拟滚动以保持高性能，并支持多选和模糊搜索。</p>
    <div class="tree-wrapper">
      <!-- v-if 用于确保在树数据生成完毕后再渲染组件 -->
      <select-tree v-if="treeData.length" :data="treeData" :tree-props="treeProps" />
      <div v-else class="loading-placeholder">
        正在生成 {{ (5000).toLocaleString() }} 条树形数据...
      </div>
    </div>
  </div>
</template>

<script>
import SelectTree from './components/SelectTree.vue';

// 用于生成大规模树形数据的函数
let idCounter = 0;
/**
 * 递归生成树形数据
 * @param {string} path - 当前节点的路径，用于生成唯一ID
 * @param {number} level - 当前递归的层级
 * @param {number} maxLevel - 最大层级限制
 * @param {number[]} nodesPerLevel - 每个层级生成的节点数量
 * @returns {Array} - 生成的节点数组
 */
function generateTreeData(path = '0', level = 1, maxLevel = 7, nodesPerLevel = [8, 5, 4, 3, 3, 2, 2]) {
  if (level > maxLevel) {
    return [];
  }

  const nodes = [];
  const numNodes = nodesPerLevel[level - 1] || 2;

  for (let i = 1; i <= numNodes; i++) {
    const instId = `${path}-${i}`;
    idCounter++;
    const node = {
      instId: instId,
      // 将ID中的'-'替换为空格，以便更好地进行文本搜索演示
      instAttrName: `机构 ${instId.replace(/-/g, ' ')}`, 
      children: generateTreeData(instId, level + 1, maxLevel, nodesPerLevel),
    };
    nodes.push(node);
  }
  return nodes;
}

export default {
  name: "App",
  components: {
    SelectTree,
  },
  data() {
    return {
      treeData: [],
      nodeCount: 0,
      // 定义树形组件如何解析我们的数据
      treeProps: {
        id: 'instId',
        label: 'instAttrName',
        children: 'children',
      }
    };
  },
  created() {
    // 使用 setTimeout 以非阻塞方式生成数据，避免UI卡顿
    setTimeout(() => {
      console.time('DataGeneration');
      idCounter = 0;
      this.treeData = generateTreeData('0', 1, 7, [8, 5, 4, 3, 3, 2, 2]);
      this.nodeCount = idCounter;
      console.timeEnd('DataGeneration');
    }, 0);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 20px;
}
.tree-wrapper {
  width: 100%;
  max-width: 500px;
}
.loading-placeholder {
  padding: 20px;
  text-align: center;
  color: #909399;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>