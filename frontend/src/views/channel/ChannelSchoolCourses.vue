<template>
  <div class="channel-school-courses">
    <div class="page-header">
      <el-button @click="goBack" text>
        <el-icon><ArrowLeft /></el-icon>
        返回学校详情
      </el-button>
      <h2>课程列表</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
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
            <h3>{{ course.title }}</h3>
            <p>{{ course.description || '暂无描述' }}</p>
            
            <div class="course-meta">
              <el-tag :type="getDifficultyType(course.difficulty)" size="small">
                {{ getDifficultyName(course.difficulty) }}
              </el-tag>
            </div>

            <div class="course-stats">
              <div><el-icon><User /></el-icon><span>{{ course.class.current_members }}人</span></div>
              <div><el-icon><Document /></el-icon><span>{{ course.statistics.unit_count }}单元</span></div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Reading, User, Document } from '@element-plus/icons-vue'
import { getSchoolCourses } from '@/api/channel'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const courses = ref([])

const loadCourses = async () => {
  loading.value = true
  try {
    const response = await getSchoolCourses(route.params.id)
    courses.value = response.data.data || []
  } catch (error) {
    console.error('加载课程列表失败:', error)
    ElMessage.error('加载课程列表失败')
  } finally {
    loading.value = false
  }
}

const getDifficultyType = (d) => ({ beginner: 'success', intermediate: 'warning', advanced: 'danger' }[d] || 'info')
const getDifficultyName = (d) => ({ beginner: '初级', intermediate: '中级', advanced: '高级' }[d] || d)
const goToCourseDetail = (uuid) => router.push(`/channel/courses/${uuid}`)
const goBack = () => router.push(`/channel/schools/${route.params.id}`)

onMounted(() => loadCourses())
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
  
  .course-cover {
    width: 100%;
    height: 180px;
    overflow: hidden;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    
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
    
    h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #909399;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  
  .course-stats {
    display: flex;
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    
    div {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
