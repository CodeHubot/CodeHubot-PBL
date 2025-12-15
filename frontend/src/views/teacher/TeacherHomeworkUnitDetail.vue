<template>
  <div class="teacher-homework-unit-detail">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回单元列表
      </el-button>
      <h2 v-if="unitInfo">{{ unitInfo.title }} - 作业管理</h2>
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
          <span><strong>作业任务：</strong>{{ unitInfo.task_count }}</span>
          <span><strong>单元顺序：</strong>第 {{ unitInfo.order }} 单元</span>
        </div>
      </el-card>

      <!-- 学生作业表格 -->
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>学生作业提交情况</span>
            <span class="total-info">共 {{ students.length }} 名学生</span>
          </div>
        </template>

        <el-table :data="students" style="width: 100%">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="student_name" label="学生姓名" min-width="120" fixed />
          <el-table-column prop="student_number" label="学号" min-width="120" />
          <el-table-column label="提交进度" min-width="200">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress 
                  :percentage="row.submission_rate" 
                  :color="getProgressColor(row.submission_rate)"
                />
                <span class="progress-text">
                  {{ row.submitted_count }} / {{ row.total_tasks }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="作业明细" min-width="400">
            <template #default="{ row }">
              <div class="task-submissions">
                <div
                  v-for="task in row.task_submissions"
                  :key="task.task_id"
                  class="task-item"
                >
                  <div class="task-info">
                    <el-tag
                      :type="getTaskStatusType(task.status)"
                      size="small"
                    >
                      {{ task.status }}
                    </el-tag>
                    <span class="task-title">{{ task.task_title }}</span>
                  </div>
                  <div v-if="task.is_submitted" class="task-actions">
                    <span v-if="task.score !== null" class="score">
                      得分: {{ task.score }}
                    </span>
                    <el-button
                      v-if="task.status === '待批改'"
                      type="primary"
                      size="small"
                      @click="openGradeDialog(task)"
                    >
                      批改
                    </el-button>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 批改对话框 -->
    <el-dialog v-model="gradeDialogVisible" title="批改作业" width="500px">
      <el-form :model="gradeForm" label-width="80px">
        <el-form-item label="学生">
          {{ currentTask?.student_name }}
        </el-form-item>
        <el-form-item label="任务">
          {{ currentTask?.task_title }}
        </el-form-item>
        <el-form-item label="分数" required>
          <el-input-number 
            v-model="gradeForm.score" 
            :min="0" 
            :max="100"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="评语">
          <el-input
            v-model="gradeForm.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入评语（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="grading" @click="submitGrade">
          提交批改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getUnitHomework, gradeHomework } from '@/api/teacher'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const unitInfo = ref(null)
const students = ref([])

const gradeDialogVisible = ref(false)
const grading = ref(false)
const currentTask = ref(null)
const gradeForm = ref({
  score: 0,
  feedback: ''
})

const loadUnitHomework = async () => {
  loading.value = true
  try {
    const response = await getUnitHomework(route.params.uuid, route.params.unitId)
    const data = response.data.data
    unitInfo.value = data.unit
    students.value = data.students
  } catch (error) {
    console.error('加载单元作业失败:', error)
    ElMessage.error('加载单元作业失败')
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

const getTaskStatusType = (status) => {
  const map = {
    '未提交': 'info',
    '待批改': 'warning',
    '已批改': 'success'
  }
  return map[status] || 'info'
}

const openGradeDialog = (task) => {
  currentTask.value = task
  gradeForm.value = {
    score: task.score || 0,
    feedback: task.feedback || ''
  }
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  if (!currentTask.value?.progress_id) {
    ElMessage.error('无效的提交记录')
    return
  }
  
  grading.value = true
  try {
    await gradeHomework(currentTask.value.progress_id, gradeForm.value)
    ElMessage.success('批改成功')
    gradeDialogVisible.value = false
    await loadUnitHomework() // 重新加载数据
  } catch (error) {
    console.error('批改失败:', error)
    ElMessage.error('批改失败')
  } finally {
    grading.value = false
  }
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}/homework`)
}

onMounted(() => {
  loadUnitHomework()
})
</script>

<style scoped lang="scss">
.teacher-homework-unit-detail {
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

.task-submissions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    
    .task-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      
      .task-title {
        font-size: 14px;
        color: #606266;
      }
    }
    
    .task-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .score {
        font-size: 14px;
        color: #67c23a;
        font-weight: 600;
      }
    }
  }
}
</style>
