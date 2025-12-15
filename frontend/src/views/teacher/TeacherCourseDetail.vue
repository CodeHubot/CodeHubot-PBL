<template>
  <div class="teacher-course-detail">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回班级列表
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <div v-else-if="course" class="detail-content">
      <!-- 课程头部 -->
      <el-card class="header-card" shadow="never">
        <h1 class="course-title">{{ course.title }}</h1>
        <p class="course-description">{{ course.description }}</p>
        
        <div class="course-meta">
          <el-tag v-if="course.teacher_role?.is_primary" type="success">主讲教师</el-tag>
          <el-tag v-else type="info">助教</el-tag>
          <span class="meta-item" v-if="course.class">
            班级：{{ course.class.name }}
          </span>
        </div>
      </el-card>

      <!-- 快捷操作 -->
      <el-card class="actions-card" shadow="never">
        <template #header>
          <span>快捷操作</span>
        </template>
        <div class="actions-grid">
          <el-button size="large" @click="goToMembers">
            <el-icon><User /></el-icon>
            班级成员
          </el-button>
          <el-button size="large" @click="goToGroups">
            <el-icon><Grid /></el-icon>
            分组管理
          </el-button>
          <el-button size="large" @click="goToProgress">
            <el-icon><TrendCharts /></el-icon>
            学习进度
          </el-button>
          <el-button size="large" @click="goToHomework">
            <el-icon><Document /></el-icon>
            作业管理
          </el-button>
        </div>
      </el-card>

      <!-- 单元列表 -->
      <el-card class="units-card" shadow="never">
        <template #header>
          <span>课程单元</span>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="unit in course.units"
            :key="unit.id"
            :timestamp="unit.title"
            placement="top"
          >
            <div class="unit-item">
              <p>{{ unit.description || '暂无描述' }}</p>
              <el-tag size="small">{{ unit.task_count }} 个任务</el-tag>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Grid, TrendCharts, Document, User } from '@element-plus/icons-vue'
import { getTeacherCourseDetail } from '@/api/teacher'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const course = ref(null)

const loadCourseDetail = async () => {
  loading.value = true
  try {
    const courseUuid = route.params.uuid
    const response = await getTeacherCourseDetail(courseUuid)
    course.value = response.data.data
  } catch (error) {
    console.error('加载课程详情失败:', error)
    ElMessage.error('加载课程详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/teacher/courses')
}

const goToMembers = () => {
  router.push(`/teacher/courses/${route.params.uuid}/members`)
}

const goToGroups = () => {
  router.push(`/teacher/courses/${route.params.uuid}/groups`)
}

const goToProgress = () => {
  router.push(`/teacher/courses/${route.params.uuid}/progress`)
}

const goToHomework = () => {
  router.push(`/teacher/courses/${route.params.uuid}/homework`)
}

onMounted(() => {
  loadCourseDetail()
})
</script>

<style scoped lang="scss">
.teacher-course-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.loading-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.detail-content {
  .header-card {
    margin-bottom: 24px;
    
    .course-title {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
    
    .course-description {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #606266;
      line-height: 1.6;
    }
    
    .course-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .meta-item {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .actions-card {
    margin-bottom: 24px;
    
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      
      .el-button {
        height: 56px;
        font-size: 16px;
      }
    }
  }
  
  .units-card {
    .unit-item {
      p {
        margin: 0 0 8px 0;
        color: #606266;
      }
    }
  }
}
</style>
