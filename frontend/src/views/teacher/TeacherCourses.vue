<template>
  <div class="teacher-courses">
    <div class="page-header">
      <h2>我的班级</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="4" animated />
    </div>

    <div v-else-if="courses.length === 0" class="empty-container">
      <el-empty description="暂无负责的班级" />
    </div>

    <el-row v-else :gutter="24">
      <el-col v-for="course in courses" :key="course.id" :span="8">
        <el-card class="course-card" shadow="hover" @click="goToCourseDetail(course.uuid)">
          <div class="course-cover" v-if="course.cover_image">
            <img :src="course.cover_image" :alt="course.title" />
          </div>
          <div class="course-cover placeholder" v-else>
            <el-icon><Reading /></el-icon>
          </div>
          
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">{{ course.description || '暂无描述' }}</p>
            
            <div class="course-meta">
              <el-tag v-if="course.is_primary" type="success" size="small">主讲教师</el-tag>
              <el-tag v-else type="info" size="small">助教</el-tag>
              <el-tag :type="getDifficultyType(course.difficulty)" size="small">
                {{ getDifficultyName(course.difficulty) }}
              </el-tag>
            </div>

            <div class="course-stats" v-if="course.class">
              <div class="stat-item">
                <el-icon><User /></el-icon>
                <span>{{ course.class.current_members }}人</span>
              </div>
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ course.unit_count }}个单元</span>
              </div>
            </div>
            
            <div class="course-actions">
              <el-button type="primary" size="small" @click.stop="goToCourseDetail(course.uuid)">
                进入课程
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Reading, User, Document } from '@element-plus/icons-vue'
import { getTeacherCourses } from '@/api/teacher'

const router = useRouter()

const loading = ref(true)
const courses = ref([])

const loadCourses = async () => {
  loading.value = true
  try {
    const response = await getTeacherCourses()
    courses.value = response.data.data || []
  } catch (error) {
    console.error('加载课程列表失败:', error)
    ElMessage.error('加载课程列表失败')
  } finally {
    loading.value = false
  }
}

const getDifficultyType = (difficulty) => {
  const typeMap = {
    'beginner': 'success',
    'intermediate': 'warning',
    'advanced': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const getDifficultyName = (difficulty) => {
  const nameMap = {
    'beginner': '初级',
    'intermediate': '中级',
    'advanced': '高级'
  }
  return nameMap[difficulty] || difficulty
}

const goToCourseDetail = (courseUuid) => {
  router.push(`/teacher/courses/${courseUuid}`)
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped lang="scss">
.teacher-courses {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }
}

.loading-container,
.empty-container {
  background: white;
  padding: 40px;
  border-radius: 12px;
}

.course-card {
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  :deep(.el-card__body) {
    padding: 0;
  }
}

.course-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 48px;
  }
}

.course-info {
  padding: 16px;
}

.course-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 40px;
}

.course-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.course-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #606266;
  }
}

.course-actions {
  .el-button {
    width: 100%;
  }
}
</style>
