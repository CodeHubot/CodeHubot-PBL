<template>
  <div class="teacher-dashboard">
    <div class="welcome-card">
      <h2>欢迎回来，{{ teacherName }} 老师！</h2>
      <p>{{ schoolName }}</p>
    </div>

    <el-row :gutter="24">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="负责课程" :value="courseCount" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="待批改作业" :value="pendingHomework" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <el-statistic title="管理班级" :value="classCount" />
        </el-card>
      </el-col>
    </el-row>

    <el-card class="quick-actions" shadow="never">
      <template #header>
        <span>快捷操作</span>
      </template>
      <div class="actions-grid">
        <el-button size="large" @click="goToCourses">
          <el-icon><Reading /></el-icon>
          查看我的课程
        </el-button>
        <el-button size="large" @click="goToHomework">
          <el-icon><Document /></el-icon>
          批改作业
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Reading, Document } from '@element-plus/icons-vue'
import { useTeacherAuthStore } from '@/store/teacherAuth'
import { getTeacherCourses } from '@/api/teacher'

const router = useRouter()
const teacherAuthStore = useTeacherAuthStore()

const courseCount = ref(0)
const pendingHomework = ref(0)
const classCount = ref(0)

const teacherName = computed(() => teacherAuthStore.teacherName)
const schoolName = computed(() => teacherAuthStore.schoolName)

const loadStatistics = async () => {
  try {
    const response = await getTeacherCourses()
    const courses = response.data.data || []
    courseCount.value = courses.length
    // TODO: 统计班级数量和待批改作业数量
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const goToCourses = () => {
  router.push('/teacher/courses')
}

const goToHomework = () => {
  router.push('/teacher/courses')
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
.teacher-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 28px;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    opacity: 0.9;
  }
}

.stat-card {
  margin-bottom: 24px;
  
  :deep(.el-statistic__content) {
    font-size: 32px;
    font-weight: 600;
    color: #667eea;
  }
}

.quick-actions {
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    
    .el-button {
      height: 56px;
      font-size: 16px;
    }
  }
}
</style>
