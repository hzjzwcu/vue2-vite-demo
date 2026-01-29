<!-- 使用van-datetime-picker和dayjs实现日期范围选择 -->
<template>
  <div>
    <van-cell
      title="选择日期"
      :value="displayDate"
      @click="showPicker = true"
      is-link
    />
    <van-popup v-model="showPicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择日期"
        :filter="filter"
        :max-date="maxDate"
        @confirm="onConfirm"
        @cancel="showPicker = false"
        @change="onChange"
      />
    </van-popup>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: "DateRangeDemo",
  data() {
    return {
      displayDate: '', // 用于界面显示的日期，初始为空
      showPicker: false, // 控制日期选择器弹窗的显示隐藏
      currentDate: dayjs().subtract(1, 'day').toDate(), // 日期选择器的当前选中日期（v-model绑定）
      maxDate: new Date(), // 最大可选日期，即今天，用于禁用未来日期
    };
  },
  methods: {
    // 确认选择日期
    onConfirm(date) {
      this.displayDate = dayjs(date).format('YYYY/MM/DD');
      this.showPicker = false;
    },
    // 日期选择器值改变时的回调函数（用于确保filter函数能获取到正确的上下文）
    onChange(picker) {
      // picker组件的v-model="currentDate"会响应式更新this.currentDate。
      // 因此，在filter函数执行时，this.currentDate应该已经更新为当前显示月的日期。
      // 这个函数本身可能不是filter工作所必需的，但对于调试或需要额外逻辑时很有用。
    },
    // 选项过滤函数
    filter(type, options) {
      if (type === 'day') {
        // 从picker的v-model `currentDate` 获取当前显示的年份和月份
        const year = dayjs(this.currentDate).year();
        const month = dayjs(this.currentDate).month(); // month()是0索引的

        // 获取今天日期，并将其时间设为00:00:00，以便进行日期比较
        const today = dayjs().startOf('day');

        return options.filter(optionValue => { // optionValue 是字符串，例如 '01'
          const day = parseInt(optionValue, 10);
          
          // 构建当前选项的完整日期，用于评估
          const currentOptionDate = dayjs(new Date(year, month, day));

          // 如果日期无效（例如，二月没有30号）或早于今天，则不应包含在筛选列表中
          if (!currentOptionDate.isValid() || currentOptionDate.isAfter(today, 'day')) {
            return false; // 排除此选项
          }
          
          // 条件1: 处于今天之前的35天内
          const diff = today.diff(currentOptionDate, 'day');
          const isWithin35Days = diff > 0 && diff <= 35;
          
          // 条件2: 是月末
          const isEndOfMonth = currentOptionDate.isSame(currentOptionDate.endOf('month'), 'day');

          // 条件3: 从2025年至今的10号或20号
          const isSpecialDayAfter2025 = currentOptionDate.year() >= 2025 && (currentOptionDate.date() === 10 || currentOptionDate.date() === 20);
          
          // 如果满足任一条件，则日期可选
          const isSelectable = isWithin35Days || isEndOfMonth || isSpecialDayAfter2025;
          
          return isSelectable; // 只返回可选的选项
        });
      }
      // 对于其他类型（年、月），如果没有指定过滤规则，则原样返回
      // 您也可以在此处对年/月应用过滤，例如，隐藏当前年份的未来月份。
      if (type === 'month') {
        const currentYear = dayjs(this.currentDate).year();
        const currentMonth = dayjs().month(); // 0索引的当前月份

        // 如果picker中显示的年份是当前年份，则过滤掉未来的月份
        if (currentYear === dayjs().year()) {
          return options.filter(monthValue => {
            return parseInt(monthValue, 10) <= (currentMonth + 1); // +1 因为monthValue是1索引的
          });
        }
      }
      // 同样，对于年份，如果您想限制历史年份。
      // 例如，如果您只想显示从1990年到今年的年份：
      if (type === 'year') {
         return options.filter(yearValue => parseInt(yearValue, 10) >= 1990 && parseInt(yearValue, 10) <= dayjs().year()); // 示例: 限制年份范围
      }
      return options;
    },
  },
};
</script>

<style>
</style>
