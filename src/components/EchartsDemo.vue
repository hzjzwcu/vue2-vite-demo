<template>
  <div ref="chart" style="width: 600px; height: 400px;"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChartDemo',
  mounted() {
    const chart = echarts.init(this.$refs.chart)

    const chartOptions = {
      tooltip: {},
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: [120, 200, 150, 80, 70]
        }
      ]
    }

    chart.setOption(chartOptions)

    // 窗口 resize
    window.addEventListener('resize', chart.resize)
  }
}
</script>
