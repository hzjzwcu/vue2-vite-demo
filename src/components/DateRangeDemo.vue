<!-- 可选最近35天和每月末以及25年以后每月旬的日期筛选器 -->
 <template>
  <div>
    <el-date-picker
      v-model="value1"
      type="date"
      placeholder="选择日期"
      :picker-options="pickerOptions"
    >
    </el-date-picker>
  </div>
</template>
 
 <script>
export default {
  name: "DateRangeDemo",
  data() {
    return {
      value1: "",
      pickerOptions: {
        disabledDate: function(time) {
            
        }
      }
    };
  },
};
</script>
 
 <style>
</style>