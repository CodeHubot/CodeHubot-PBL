<template>
  <div class="teacher-progress-unit-detail">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回单元列表
      </el-button>
      <h2 v-if="unitInfo">{{ unitInfo.title }} - 学习进度</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else class="content">
      <!-- 单元信息 -->
      <el-card v-if="unitInfo" shadow="never" class="unit-info-card">
        <h3>单元信息</h3>
        <p>{{ unitInfo.description || '暂无描述' }}</p>
        <div class="info-items">
          <span><strong>任务数量：</strong>{{ unitInfo.task_count }}</span>
          <span><strong>单元顺序：</strong>第 {{ unitInfo.order }} 单元</span>
        </div>
      </el-card>

      <!-- 学生进度表格 -->
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>学生学习进度</span>
            <span class="total-info">共 {{ students.length }} 名学生</span>
          </div>
        </template>

        <el-table :data="students" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="student_name" label="学生姓名" min-width="120" fixed />
          <el-table-column prop="student_number" label="学号" min-width="120" />
          <el-table-column label="完成进度" min-width="200">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress 
                  :percentage="row.progress_percentage" 
                  :color="getProgressColor(row.progress_percentage)"
                />
                <span class="progress-text">
                  {{ row.completed_tasks }} / {{ row.total_tasks }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="任务明细" min-width="300">
            <template #default="{ row }">
              <div class="task-details">
                <el-tag
                  v-for="task in row.task_details"
                  :key="task.task_id"
                  :type="task.is_completed ? 'success' : 'info'"
                  size="small"
                  class="task-tag"
                >
                  <el-icon v-if="task.is_completed"><Check /></el-icon>
                  <el-icon v-else><Close /></el-icon>
                  {{ task.task_title }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Close } from '@element-plus/icons-vue'
import { getUnitProgress } from '@/api/teacher'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const unitInfo = ref(null)
const students = ref([])

const loadUnitProgress = async () => {
  loading.value = true
  try {
    const response = await getUnitProgress(route.params.uuid, route.params.unitId)
    const data = response.data.data
    unitInfo.value = data.unit
    students.value = data.students
  } catch (error) {
    console.error('加载单元进度失败:', error)
    ElMessage.error('加载单元进度失败')
  } finally {
    loading.value = false
  }
}

const getProgressColor = (percentage) => {
  if (percentage === 100) return '#67c23a'
  if (percentage >= 60) return '#409eff'
  if (percentage >= 30) return '#e6a23c'
  return '#f56c6c'
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}/progress`)
}

onMounted(() => {
  loadUnitProgress()
})
</script>

<style scoped lang="scss">
.teacher-progress-unit-detail {
  max-width: 1600px;
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

.unit-info-card {
  margin-bottom: 24px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
  }
  
  p {
    margin: 0 0 12px 0;
    color: #606266;
    line-height: 1.6;
  }
  
  .info-items {
    display: flex;
    gap: 24px;
    
    span {
      color: #606266;
      font-size: 14px;
    }
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .total-info {
    color: #909399;
    font-size: 14px;
  }
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .el-progress {
    flex: 1;
  }
  
  .progress-text {
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
  }
}

.task-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  
  .task-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
