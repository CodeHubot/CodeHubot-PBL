<template>
  <div class="teacher-homework">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回课程详情
      </el-button>
      <h2>作业管理</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else class="homework-content">
      <!-- 筛选器 -->
      <el-card class="filter-card" shadow="never">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="单元筛选">
            <el-select v-model="filterForm.unit_id" placeholder="全部单元" clearable>
              <el-option
                v-for="unit in units"
                :key="unit.id"
                :label="unit.title"
                :value="unit.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态筛选">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="待批改" value="review" />
              <el-option label="已批改" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadHomeworkList">查询</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 作业列表 -->
      <el-card class="homework-list-card" shadow="never">
        <template #header>
          <span>作业任务列表</span>
        </template>

        <el-table :data="homeworkList" style="width: 100%">
          <el-table-column prop="unit_title" label="所属单元" min-width="150" />
          <el-table-column prop="task_title" label="任务名称" min-width="200" />
          <el-table-column prop="task_type" label="任务类型" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getTaskTypeTag(row.task_type)" size="small">
                {{ getTaskTypeName(row.task_type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" min-width="80">
            <template #default="{ row }">
              <el-tag :type="getDifficultyTag(row.difficulty)" size="small">
                {{ getDifficultyName(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="截止时间" min-width="150">
            <template #default="{ row }">
              <span v-if="row.deadline">
                {{ formatDateTime(row.deadline) }}
              </span>
              <span v-else class="text-muted">无截止时间</span>
            </template>
          </el-table-column>
          <el-table-column label="提交情况" min-width="100" align="center">
            <template #default="{ row }">
              <span class="stat-text">{{ row.statistics.total_submissions }}</span>
            </template>
          </el-table-column>
          <el-table-column label="待批改" min-width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.statistics.pending_review > 0" type="warning">
                {{ row.statistics.pending_review }}
              </el-tag>
              <span v-else class="text-muted">0</span>
            </template>
          </el-table-column>
          <el-table-column label="已批改" min-width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.statistics.graded > 0" type="success">
                {{ row.statistics.graded }}
              </el-tag>
              <span v-else class="text-muted">0</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="viewSubmissions(row)"
              >
                查看提交
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 作业提交详情对话框 -->
    <el-dialog
      v-model="submissionsDialogVisible"
      :title="`${currentTask?.task_title} - 提交详情`"
      width="80%"
      top="5vh"
    >
      <div class="submissions-content">
        <el-table :data="submissions" style="width: 100%" max-height="600">
          <el-table-column prop="student_name" label="学生姓名" min-width="120" fixed />
          <el-table-column prop="student_number" label="学号" min-width="120" />
          <el-table-column prop="status" label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)" size="small">
                {{ getStatusName(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="提交时间" min-width="150">
            <template #default="{ row }">
              <span v-if="row.submitted_at">
                {{ formatDateTime(row.submitted_at) }}
              </span>
              <span v-else class="text-muted">未提交</span>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="分数" min-width="80" align="center">
            <template #default="{ row }">
              <span v-if="row.score !== null" class="score-text">{{ row.score }}</span>
              <span v-else class="text-muted">-</span>
            </template>
          </el-table-column>
          <el-table-column label="批改时间" min-width="150">
            <template #default="{ row }">
              <span v-if="row.graded_at">
                {{ formatDateTime(row.graded_at) }}
              </span>
              <span v-else class="text-muted">未批改</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'review'"
                type="primary"
                size="small"
                @click="gradeSubmission(row)"
              >
                批改
              </el-button>
              <el-button
                v-if="row.submission"
                type="info"
                size="small"
                @click="viewSubmissionDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 批改作业对话框 -->
    <el-dialog
      v-model="gradeDialogVisible"
      title="批改作业"
      width="600px"
    >
      <div class="grade-content">
        <div class="student-info">
          <h4>学生信息</h4>
          <p><strong>姓名：</strong>{{ currentSubmission?.student_name }}</p>
          <p><strong>学号：</strong>{{ currentSubmission?.student_number }}</p>
          <p><strong>提交时间：</strong>{{ formatDateTime(currentSubmission?.submitted_at) }}</p>
        </div>

        <div class="submission-detail" v-if="currentSubmission?.submission">
          <h4>作业内容</h4>
          <div class="submission-text">
            {{ JSON.stringify(currentSubmission.submission, null, 2) }}
          </div>
        </div>

        <el-form :model="gradeForm" :rules="gradeRules" ref="gradeFormRef" label-width="80px">
          <el-form-item label="分数" prop="score">
            <el-input-number
              v-model="gradeForm.score"
              :min="0"
              :max="100"
              placeholder="请输入分数"
            />
          </el-form-item>
          <el-form-item label="反馈" prop="feedback">
            <el-input
              v-model="gradeForm.feedback"
              type="textarea"
              :rows="6"
              placeholder="请输入批改反馈"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="gradeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrade" :loading="grading">
          {{ grading ? '提交中...' : '提交批改' }}
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
import {
  getCourseHomework,
  getHomeworkSubmissions,
  gradeHomework
} from '@/api/teacher'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const homeworkList = ref([])
const units = ref([])
const filterForm = ref({
  unit_id: null,
  status: null
})

// 提交详情相关
const submissionsDialogVisible = ref(false)
const currentTask = ref(null)
const submissions = ref([])

// 批改相关
const gradeDialogVisible = ref(false)
const currentSubmission = ref(null)
const grading = ref(false)
const gradeFormRef = ref(null)
const gradeForm = ref({
  score: 0,
  feedback: ''
})

const gradeRules = {
  score: [
    { required: true, message: '请输入分数', trigger: 'blur' }
  ]
}

const loadHomeworkList = async () => {
  loading.value = true
  try {
    const courseUuid = route.params.uuid
    const params = {}
    if (filterForm.value.unit_id) {
      params.unit_id = filterForm.value.unit_id
    }
    if (filterForm.value.status) {
      params.status = filterForm.value.status
    }
    
    const response = await getCourseHomework(courseUuid, params)
    homeworkList.value = response.data.data || []
    
    // 提取单元列表（去重）
    const unitMap = new Map()
    homeworkList.value.forEach(hw => {
      if (!unitMap.has(hw.unit_id)) {
        unitMap.set(hw.unit_id, {
          id: hw.unit_id,
          title: hw.unit_title
        })
      }
    })
    units.value = Array.from(unitMap.values())
  } catch (error) {
    console.error('加载作业列表失败:', error)
    ElMessage.error('加载作业列表失败')
  } finally {
    loading.value = false
  }
}

const viewSubmissions = async (task) => {
  currentTask.value = task
  try {
    const response = await getHomeworkSubmissions(task.task_id)
    submissions.value = response.data.data || []
    submissionsDialogVisible.value = true
  } catch (error) {
    console.error('加载提交记录失败:', error)
    ElMessage.error('加载提交记录失败')
  }
}

const gradeSubmission = (submission) => {
  currentSubmission.value = submission
  gradeForm.value = {
    score: submission.score || 0,
    feedback: submission.feedback || ''
  }
  gradeDialogVisible.value = true
}

const submitGrade = async () => {
  if (!gradeFormRef.value) return
  
  try {
    const valid = await gradeFormRef.value.validate()
    if (!valid) return
    
    grading.value = true
    await gradeHomework(currentSubmission.value.id, gradeForm.value)
    ElMessage.success('批改成功')
    gradeDialogVisible.value = false
    
    // 重新加载提交列表
    await viewSubmissions(currentTask.value)
    await loadHomeworkList()
  } catch (error) {
    console.error('批改失败:', error)
    ElMessage.error('批改失败')
  } finally {
    grading.value = false
  }
}

const viewSubmissionDetail = (submission) => {
  ElMessage.info('查看详情功能开发中')
  // TODO: 打开详情对话框，显示完整的提交内容
}

const getTaskTypeTag = (type) => {
  const tagMap = {
    'analysis': 'primary',
    'coding': 'success',
    'design': 'warning',
    'deployment': 'danger'
  }
  return tagMap[type] || 'info'
}

const getTaskTypeName = (type) => {
  const nameMap = {
    'analysis': '分析',
    'coding': '编程',
    'design': '设计',
    'deployment': '部署',
    'research': '研究',
    'presentation': '展示'
  }
  return nameMap[type] || type
}

const getDifficultyTag = (difficulty) => {
  const tagMap = {
    'easy': 'success',
    'medium': 'warning',
    'hard': 'danger'
  }
  return tagMap[difficulty] || 'info'
}

const getDifficultyName = (difficulty) => {
  const nameMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return nameMap[difficulty] || difficulty
}

const getStatusTag = (status) => {
  const tagMap = {
    'pending': 'info',
    'in-progress': 'primary',
    'review': 'warning',
    'completed': 'success'
  }
  return tagMap[status] || 'info'
}

const getStatusName = (status) => {
  const nameMap = {
    'pending': '未开始',
    'in-progress': '进行中',
    'review': '待批改',
    'completed': '已完成'
  }
  return nameMap[status] || status
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

const goBack = () => {
  router.push(`/teacher/courses/${route.params.uuid}`)
}

onMounted(() => {
  loadHomeworkList()
})
</script>

<style scoped lang="scss">
.teacher-homework {
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

.loading-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.filter-card {
  margin-bottom: 24px;
}

.homework-list-card {
  .text-muted {
    color: #909399;
    font-size: 12px;
  }
  
  .stat-text {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

.submissions-content {
  .text-muted {
    color: #909399;
  }
  
  .score-text {
    font-size: 16px;
    font-weight: 600;
    color: #409eff;
  }
}

.grade-content {
  .student-info {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #303133;
    }
    
    p {
      margin: 8px 0;
      font-size: 14px;
      color: #606266;
    }
  }
  
  .submission-detail {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #303133;
    }
    
    .submission-text {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 12px;
      color: #606266;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>
