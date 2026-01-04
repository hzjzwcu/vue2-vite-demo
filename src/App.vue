<template>
  <div id="app">
    <h1>高性能虚拟树选择器 (Select Tree)</h1>
    <p>
      此示例展示了一个内嵌 <strong>{{ nodeCount.toLocaleString() }}</strong> 个节点 (7层) 树的 Select 组件。
    </p>
    <p>它使用 <code>vue-virtual-scroll-list</code> 实现虚拟滚动以保持高性能，并支持多选和模糊搜索。</p>
    <div class="controls-wrapper">
      <div class="control-item">
        <label>联动模式:</label>
        <el-select v-model="linkage" placeholder="请选择">
          <el-option label="父子关联" :value="true"></el-option>
          <el-option label="父子不关联" :value="false"></el-option>
        </el-select>
      </div>
      <div class="tree-wrapper">
        <!-- v-if 用于确保在树数据生成完毕后再渲染组件 -->
        <select-tree v-if="treeData.length" :data="treeData" :tree-props="treeProps" :linked="linkage" />
        <div v-else class="loading-placeholder">
          正在生成 {{ (5000).toLocaleString() }} 条树形数据...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SelectTree from './components/SelectTree.vue';
import ElSelect from 'element-ui/lib/select';
import ElOption from 'element-ui/lib/option';

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
    ElSelect,
    ElOption,
  },
  data() {
    return {
      treeData: [],
      nodeCount: 0,
      linkage: true, // 控制联动模式
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
.controls-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}
.control-item {
  display: flex;
  flex-direction: column;
}
.control-item label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}
.tree-wrapper {
  width: 100%;
  max-width: 300px; /* 调整宽度以便并排显示 */
  flex-grow: 1;
}
.loading-placeholder {
  padding: 20px;
  text-align: center;
  color: #909399;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>