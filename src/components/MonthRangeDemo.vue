<!-- 根据当前月份，显示月份季度年份的可选范围 -->
<template>
  <div class="date-calculator-demo">
    <h3>月份选择器 Demo</h3>
    <p>选择一个月份，下方将根据业务逻辑显示计算后的月、季度、年。</p>
    <el-date-picker
      v-model="selectedMonth"
      type="month"
      placeholder="选择月份"
      @change="handleMonthChange"
      :clearable="false"
      value-format="yyyy-MM"
    >
    </el-date-picker>

    <div v-if="result.month" class="result-display">
      <h4>计算结果:</h4>
      <p><strong>月：</strong> {{ result.month }}</p>
      <p><strong>季度：</strong> {{ result.quarter }}</p>
      <p><strong>年份：</strong> {{ result.year }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DateCalculatorDemo",
  data() {
    return {
      selectedMonth: "",
      result: {
        month: "",
        quarter: "",
        year: "",
      },
    };
  },
  created() {
    // 设置默认值为当前月份并立即计算
    const now = new Date();
    this.selectedMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    this.handleMonthChange(this.selectedMonth);
  },
  methods: {
    handleMonthChange(value) {
      if (value) {
        const [year, month] = value.split("-").map(Number);
        const selectedDate = new Date(year, month - 1, 1);
        this.result = this.calculateDates(selectedDate);
      } else {
        this.result = { month: "", quarter: "", year: "" };
      }
    },
    /**
     * 根据选定的日期计算月、季度、年
     * @param {Date} selectedDate - 用户选择的日期
     * @returns {{month: string, quarter: string, year: string}}
     */
    calculateDates(selectedDate) {
      if (!selectedDate) {
        return { month: "", quarter: "", year: "" };
      }

      // 直接构造出上个月的第一天，这样更清晰且一步到位
      const prevMonthDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() - 1, // getMonth()返回0-11，减1会自动处理年份回滚
        1
      );

      const prevYear = prevMonthDate.getFullYear();
      const prevMonth = prevMonthDate.getMonth(); // 0-11

      // 1. 月份结果
      const monthResult = `${prevYear},${prevMonth + 1}`;

      // 2. 季度结果 (简化逻辑)
      // 根据是否为季末月，决定从当前月份回退0个季度还是1个季度（即0或3个月）
      const monthsToSubtract = (prevMonth + 1) % 3 === 0 ? 0 : 3;
      const quarterDate = new Date(prevMonthDate);
      quarterDate.setMonth(quarterDate.getMonth() - monthsToSubtract);

      const quarterResult = `${quarterDate.getFullYear()},${
        Math.floor(quarterDate.getMonth() / 3) + 1
      }`;

      // 3. 年份结果 (使用三元运算符)
      const yearResult = prevMonth === 11 ? prevYear : prevYear - 1;

      return {
        month: monthResult,
        quarter: quarterResult,
        year: String(yearResult),
      };
    },
  },
};
</script>

<style scoped>
.date-calculator-demo {
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  max-width: 400px;
  margin: 20px auto;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
.result-display {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.result-display h4 {
  margin-top: 0;
}
.result-display p {
  margin: 8px 0;
}
</style>
