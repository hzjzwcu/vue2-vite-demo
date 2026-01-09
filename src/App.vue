<template>
  <div id="app">
    <div class="container">
      <h1>Element UI MessageBox with Overflow Tooltip</h1>
      <p>
        点击下面的按钮来查看自定义的 `MessageBox`。只有当文本被截断时，`tooltip` 才会出现。
      </p>
      <el-button @click="showConfirmBox(longText, 1)"
        >显示单行截断确认框</el-button
      >
      <el-button @click="showConfirmBox(longText, 2)"
        >显示两行截断确认框</el-button
      >
      <el-button @click="showConfirmBox(shortText, 1)"
        >显示短文本确认框 (无 Tooltip)</el-button
      >
    </div>
  </div>
</template>

<script>
import OverflowTooltip from './components/OverflowTooltip.vue';

export default {
  name: 'App',
  components: {},
  data() {
    return {
      longText:
        '这是一段非常非常长的文本，它肯定会超出容器并被省略号截断。当您将鼠标悬停在其上方时，应该会出现一个工具提示，显示完整的内容。这是一段非常非常长的文本，它肯定会超出容器并被省略号截断。当您将鼠标悬停在其上方时，应该会出现一个工具提示，显示完整的内容。', // Make it even longer for confirm box
      shortText: '这是一段短文本。',
    };
  },
  methods: {
    showConfirmBox(text, lineClamp) {
      const h = this.$createElement;
      this.$confirm(
        h(OverflowTooltip, {
          props: {
            text: text,
            lineClamp: lineClamp,
          },
        }),
        '自定义确认框', // Title for the MessageBox
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info', // Can be 'warning', 'success', 'info', 'error'
        }
      )
        .then(() => {
          this.$message({
            type: 'success',
            message: '确认成功!',
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消',
          });
        });
    },
  },
};
</script>

<style>
body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 1rem;
}

p {
  color: #606266;
  margin-bottom: 2rem;
}

.el-button {
  margin: 0 10px 10px 0 !important;
}

/* Style for MessageBox, if needed to override defaults for width etc. */
/* The MessageBox typically adjusts its width based on content, but we can set a max-width if desired */
.el-message-box {
  max-width: 80%; /* Example: limit the max width of the message box */
}
</style>