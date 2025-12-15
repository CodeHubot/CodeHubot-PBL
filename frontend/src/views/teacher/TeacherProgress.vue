<template>
  <div class="teacher-progress">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回课程详情
      </el-button>
      <h2>学习进度</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else class="progress-content">
      <!-- 整体统计 -->
      <el-row :gutter="24" class="stats-row">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总学生数" :value="progressData.overall?.total_students || 0" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="课程单元数" :value="progressData.overall?.total_units || 0" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <el-statistic 
              title="平均进度" 
              :value="progressData.overall?.average_progress || 0"
              suffix="%"
            />
          </el-card>
        </el-col>
      </el-row>

      <!-- 学生进度表格 -->
      <el-card class="table-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>学生学习进度详情</span>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索学生姓名或学号"
              :prefix-icon="Search"
              clearable
              style="width: 300px"
            />
          </div>
        </template>

        <el-table
          :data="filteredStudents"
          style="width: 100%"
          stripe
          @sort-change="handleSortChange"
        >
          <el-table-column prop="student_name" label="学生姓名" min-width="120" />
          <el-table-column prop="student_number" label="学号" min-width="120" />
          <el-table-column label="完成单元" min-width="100" align="center">
            <template #default="{ row }">
              {{ row.completed_units }} / {{ row.total_units }}
            </template>
          </el-table-column>
          <el-table-column label="完成任务" min-width="100" align="center">
            <template #default="{ row }">
              {{ row.completed_tasks }} / {{ row.total_tasks }}
            </template>
          </el-table-column>
          <el-table-column 
            prop="progress_percentage" 
            label="学习进度" 
            min-width="200"
            sortable="custom"
          >
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress
                  :percentage="row.progress_percentage"
                  :color="getProgressColor(row.progress_percentage)"
                />
                <span class="progress-text">{{ row.progress_percentage }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="学习状态" min-width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.progress_percentage)">
                {{ getStatusText(row.progress_percentage) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 进度分布图表 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <span>进度分布</span>
            </template>
            <div class="chart-container">
              <div class="progress-distribution">
                <div 
                  v-for="range in progressRanges" 
                  :key="range.label"
                  class="distribution-item"
                >
                  <div class="range-label">{{ range.label }}</div>
                  <el-progress
                    :percentage="range.percentage"
                    :color="range.color"
                  />
                  <div class="range-count">{{ range.count }} 人</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="never">
            <template #header>
              <span>学习状态统计</span>
            </template>
            <div class="status-stats">
              <div class="stat-item excellent">
                <div class="stat-label">优秀 (≥90%)</div>
                <div class="stat-value">{{ statusStats.excellent }}</div>
              </div>
              <div class="stat-item good">
                <div class="stat-label">良好 (70%-89%)</div>
                <div class="stat-value">{{ statusStats.good }}</div>
              </div>
              <div class="stat-item normal">
                <div class="stat-label">一般 (50%-69%)</div>
                <div class="stat-value">{{ statusStats.normal }}</div>
              </div>
              <div class="stat-item poor">
                <div class="stat-label">待提升 (<50%)</div>
                <div class="stat-value">{{ statusStats.poor }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { getCourseProgress } from '@/api/teacher'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const progressData = ref({
  overall: {},
  students: []
})
const searchKeyword = ref('')
const sortProp = ref('')
const sortOrder = ref('')

const filteredStudents = computed(() => {
  let students = progressData.value.students || []
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    students = students.filter(s =>
      s.student_name?.toLowerCase().includes(keyword) ||
      s.student_number?.toLowerCase().includes(keyword)
    )
  }
  
  // 排序
  if (sortProp.value) {
    students = [...students].sort((a, b) => {
      const val1 = a[sortProp.value]
      const val2 = b[sortProp.value]
      if (sortOrder.value === 'ascending') {
        return val1 - val2
      } else {
        return val2 - val1
      }
    })
  }
  
  return students
})

const progressRanges = computed(() => {
  const students = progressData.value.students || []
  const total = students.length || 1
  
  const ranges = [
    { label: '0-20%', min: 0, max: 20, color: '#f56c6c', count: 0, percentage: 0 },
    { label: '21-40%', min: 21, max: 40, color: '#e6a23c', count: 0, percentage: 0 },
    { label: '41-60%', min: 41, max: 60, color: '#409eff', count: 0, percentage: 0 },
    { label: '61-80%', min: 61, max: 80, color: '#67c23a', count: 0, percentage: 0 },
    { label: '81-100%', min: 81, max: 100, color: '#5cb87a', count: 0, percentage: 0 }
  ]
  
  students.forEach(student => {
    const progress = student.progress_percentage
    const range = ranges.find(r => progress >= r.min && progress <= r.max)
    if (range) {
      range.count++
    }
  })
  
  ranges.forEach(range => {
    range.percentage = Math.round((range.count / total) * 100)
  })
  
  return ranges
})

const statusStats = computed(() => {
  const students = progressData.value.students || []
  return {
    excellent: students.filter(s => s.progress_percentage >= 90).length,
    good: students.filter(s => s.progress_percentage >= 70 && s.progress_percentage < 90).length,
    normal: students.filter(s => s.progress_percentage >= 50 && s.progress_percentage < 70).length,
    poor: students.filter(s => s.progress_percentage < 50).length
  }
})

const loadProgress = async () => {
  loading.value = true
  try {
    const courseUuid = route.params.uuid
    const response = await getCourseProgress(courseUuid)
    progressData.value = response.data.data || { overall: {}, students: [] }
  } catch (error) {
    console.error('加载学习进度失败:', error)
    ElMessage.error('加载学习进度失败')
  } finally {
    loading.value = false
  }
}

const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop
  sortOrder.value = order
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#409eff'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getStatusType = (percentage) => {
  if (percentage >= 90) return 'success'
  if (percentage >= 70) return 'primary'
  if (percentage >= 50) return 'warning'
  return 'danger'
}

const getStatusText = (percentage) => {
  if (percentage >= 90) return '优秀'
  if (percentage >= 70) return '良好'
  if (percentage >= 50) return '一般'
  return '待提升'
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}`)
}

onMounted(() => {
  loadProgress()
})
</script>

<style scoped lang="scss">
.teacher-progress {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  h2 {
    flex: 1;
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.loading-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.stats-row {
  margin-bottom: 24px;
  
  .stat-card {
    :deep(.el-statistic__content) {
      font-size: 32px;
      font-weight: 600;
      color: #409eff;
    }
  }
}

.table-card {
  margin-bottom: 24px;
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .progress-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .el-progress {
      flex: 1;
    }
    
    .progress-text {
      min-width: 50px;
      text-align: right;
      font-size: 14px;
      font-weight: 500;
      color: #606266;
    }
  }
}

.chart-card {
  .chart-container {
    min-height: 300px;
  }
  
  .progress-distribution {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 0;
    
    .distribution-item {
      .range-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .range-count {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
  
  .status-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
    
    .stat-item {
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      
      &.excellent {
        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        color: white;
      }
      
      &.good {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        color: white;
      }
      
      &.normal {
        background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
        color: white;
      }
      
      &.poor {
        background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
        color: white;
      }
      
      .stat-label {
        font-size: 14px;
        margin-bottom: 8px;
        opacity: 0.9;
      }
      
      .stat-value {
        font-size: 36px;
        font-weight: 600;
      }
    }
  }
}
</style>
