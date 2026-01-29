<template>
  <div id="app">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="DateRangeDemo" name="DateRangeDemo">
        <DateRangeDemo />
      </el-tab-pane>
      <el-tab-pane label="MonthRangeDemo" name="MonthRangeDemo">
        <MonthRangeDemo />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DateRangeDemo from "./components/DateRangeDemo.vue";
import MonthRangeDemo from "./components/MonthRangeDemo.vue";

export default {
  name: "App",
  components: {
    DateRangeDemo,
    MonthRangeDemo,
  },
  data() {
    return {
      activeName: "DateRangeDemo",
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>