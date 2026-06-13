<template>
  <div>
    <div style="margin-bottom:24px;">
      <h1 style="color:white;margin-bottom:8px;">平台数据看板</h1>
      <p style="color:rgba(255,255,255,0.8);">实时掌握盲盒交换平台运行数据</p>
    </div>

    <div v-if="loading" style="text-align:center;padding:60px;color:white;">
      加载中...
    </div>

    <template v-else>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:24px;">
        <div class="card stat-card" style="border-left:4px solid #667eea;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="color:#999;font-size:14px;margin-bottom:8px;">总盲盒数</p>
              <h2 style="font-size:32px;color:#333;">{{ stats.total }}</h2>
            </div>
            <div style="font-size:48px;">🎁</div>
          </div>
        </div>

        <div class="card stat-card" style="border-left:4px solid #42b883;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="color:#999;font-size:14px;margin-bottom:8px;">可交换数</p>
              <h2 style="font-size:32px;color:#333;">{{ stats.available }}</h2>
            </div>
            <div style="font-size:48px;">✅</div>
          </div>
        </div>

        <div class="card stat-card" style="border-left:4px solid #f5576c;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <p style="color:#999;font-size:14px;margin-bottom:8px;">已交换数</p>
              <h2 style="font-size:32px;color:#333;">{{ stats.exchanged }}</h2>
            </div>
            <div style="font-size:48px;">🔄</div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:24px;">
        <div class="card">
          <h3 style="margin-bottom:16px;color:#333;">分类占比</h3>
          <div class="chart-box" ref="pieChartRef"></div>
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px;color:#333;">近 7 天发布趋势</h3>
          <div class="chart-box" ref="publishChartRef"></div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom:16px;color:#333;">近 7 天交换成功趋势</h3>
        <div class="chart-box" ref="exchangeChartRef"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getStats } from '../api/index.js'

const loading = ref(true)
const stats = ref({
  total: 0,
  available: 0,
  exchanged: 0,
  categoryRatio: [],
  publishTrend: [],
  exchangeTrend: []
})

const pieChartRef = ref(null)
const publishChartRef = ref(null)
const exchangeChartRef = ref(null)

let pieChart = null
let publishChart = null
let exchangeChart = null

const pieColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b']

function initPieChart() {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)
  const data = stats.value.categoryRatio
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { fontSize: 13, color: '#666' }
    },
    color: pieColors,
    series: [
      {
        name: '分类占比',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: data.length ? data : [{ name: '暂无数据', value: 1 }]
      }
    ]
  }
  pieChart.setOption(option)
}

function initPublishChart() {
  if (!publishChartRef.value) return
  if (publishChart) publishChart.dispose()
  publishChart = echarts.init(publishChartRef.value)
  const labels = stats.value.publishTrend.map(i => i.label)
  const counts = stats.value.publishTrend.map(i => i.count)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#666' },
      axisLine: { lineStyle: { color: '#e0e0e0' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#666' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '发布数量',
        type: 'bar',
        data: counts,
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
  publishChart.setOption(option)
}

function initExchangeChart() {
  if (!exchangeChartRef.value) return
  if (exchangeChart) exchangeChart.dispose()
  exchangeChart = echarts.init(exchangeChartRef.value)
  const labels = stats.value.exchangeTrend.map(i => i.label)
  const counts = stats.value.exchangeTrend.map(i => i.count)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: { color: '#666' },
      axisLine: { lineStyle: { color: '#e0e0e0' } }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#666' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: '交换成功数',
        type: 'line',
        smooth: true,
        data: counts,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#f093fb' },
            { offset: 1, color: '#f5576c' }
          ])
        },
        itemStyle: { color: '#f5576c', borderWidth: 2, borderColor: '#fff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(240,147,251,0.4)' },
            { offset: 1, color: 'rgba(245,87,108,0.05)' }
          ])
        }
      }
    ]
  }
  exchangeChart.setOption(option)
}

function handleResize() {
  pieChart && pieChart.resize()
  publishChart && publishChart.resize()
  exchangeChart && exchangeChart.resize()
}

function initAllCharts() {
  initPieChart()
  initPublishChart()
  initExchangeChart()
  setTimeout(() => {
    pieChart && pieChart.resize()
    publishChart && publishChart.resize()
    exchangeChart && exchangeChart.resize()
  }, 100)
}

async function loadStats() {
  loading.value = true
  try {
    stats.value = await getStats()
    await nextTick()
    setTimeout(() => {
      initAllCharts()
    }, 50)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStats()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart && pieChart.dispose()
  publishChart && publishChart.dispose()
  exchangeChart && exchangeChart.dispose()
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.3s, box-shadow 0.3s;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
.chart-box {
  display: block;
  width: 100%;
  height: 300px;
  min-height: 300px;
  min-width: 300px;
  overflow: hidden;
}
</style>
