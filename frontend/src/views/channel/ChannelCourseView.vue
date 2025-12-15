<template>
  <div class="channel-course-view">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>课程详情（只读）</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="course" class="detail-content">
      <el-card class="header-card" shadow="never">
        <h1>{{ course.title }}</h1>
        <p>{{ course.description }}</p>
        <div class="meta">
          <el-tag>{{ course.class.name }}</el-tag>
          <span>学生人数：{{ course.class.current_members }}</span>
        </div>
      </el-card>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-card shadow="never">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="课程名称">{{ course.title }}</el-descriptions-item>
              <el-descriptions-item label="难度">{{ course.difficulty }}</el-descriptions-item>
              <el-descriptions-item label="班级">{{ course.class.name }}</el-descriptions-item>
              <el-descriptions-item label="学生人数">{{ course.class.current_members }}</el-descriptions-item>
              <el-descriptions-item label="小组数">{{ course.class.group_count }}</el-descriptions-item>
              <el-descriptions-item label="单元数">{{ course.units.length }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="教师团队" name="teachers">
          <el-card shadow="never">
            <el-table :data="course.teachers" style="width: 100%">
              <el-table-column prop="name" label="姓名" min-width="120" />
              <el-table-column prop="teacher_number" label="工号" min-width="120" />
              <el-table-column prop="subject" label="科目" min-width="100" />
              <el-table-column label="角色" min-width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.role === 'main'" type="success">主讲</el-tag>
                  <el-tag v-else type="info">助教</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="班主任" min-width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.is_primary" type="warning">是</el-tag>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="学习进度" name="progress">
          <el-card shadow="never">
            <div v-if="loadingProgress">
              <el-skeleton :rows="4" animated />
            </div>
            <div v-else>
              <el-table :data="progressData.students" style="width: 100%">
                <el-table-column prop="student_name" label="学生" min-width="120" />
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
                <el-table-column label="进度" min-width="200">
                  <template #default="{ row }">
                    <el-progress :percentage="row.progress_percentage" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="作业统计" name="homework">
          <el-card shadow="never">
            <div v-if="loadingHomework">
              <el-skeleton :rows="4" animated />
            </div>
            <div v-else>
              <el-table :data="homeworkData" style="width: 100%">
                <el-table-column prop="unit_title" label="单元" min-width="150" />
                <el-table-column prop="task_title" label="任务" min-width="200" />
                <el-table-column label="提交数" min-width="80" align="center">
                  <template #default="{ row }">
                    {{ row.statistics.total_submissions }}
                  </template>
                </el-table-column>
                <el-table-column label="待批改" min-width="80" align="center">
                  <template #default="{ row }">
                    <el-tag v-if="row.statistics.pending_review > 0" type="warning">
                      {{ row.statistics.pending_review }}
                    </el-tag>
                    <span v-else>0</span>
                  </template>
                </el-table-column>
                <el-table-column label="已批改" min-width="80" align="center">
                  <template #default="{ row }">
                    {{ row.statistics.graded }}
                  </template>
                </el-table-column>
                <el-table-column label="平均分" min-width="80" align="center">
                  <template #default="{ row }">
                    {{ row.statistics.average_score || '-' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCourseDetail, getCourseProgress, getCourseHomework } from '@/api/channel'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const course = ref(null)
const activeTab = ref('info')
const loadingProgress = ref(false)
const loadingHomework = ref(false)
const progressData = ref({ overall: {}, students: [] })
const homeworkData = ref([])

const loadCourseDetail = async () => {
  loading.value = true
  try {
    const response = await getCourseDetail(route.params.uuid)
    course.value = response.data.data
  } catch (error) {
    console.error('加载课程详情失败:', error)
    ElMessage.error('加载课程详情失败')
  } finally {
    loading.value = false
  }
}

const loadProgress = async () => {
  loadingProgress.value = true
  try {
    const response = await getCourseProgress(route.params.uuid)
    progressData.value = response.data.data
  } catch (error) {
    console.error('加载学习进度失败:', error)
  } finally {
    loadingProgress.value = false
  }
}

const loadHomework = async () => {
  loadingHomework.value = true
  try {
    const response = await getCourseHomework(route.params.uuid)
    homeworkData.value = response.data.data || []
  } catch (error) {
    console.error('加载作业统计失败:', error)
  } finally {
    loadingHomework.value = false
  }
}

const goBack = () => router.back()

watch(activeTab, (newTab) => {
  if (newTab === 'progress' && progressData.value.students.length === 0) {
    loadProgress()
  } else if (newTab === 'homework' && homeworkData.value.length === 0) {
    loadHomework()
  }
})

onMounted(() => loadCourseDetail())
</script>

<style scoped lang="scss">
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

.header-card {
  margin-bottom: 24px;
  
  h1 {
    margin: 0 0 12px 0;
    font-size: 28px;
  }
  
  p {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #606266;
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 12px;
    
    span {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
