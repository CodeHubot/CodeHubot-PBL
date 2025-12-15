<template>
  <div class="channel-schools">
    <div class="page-header">
      <h2>学校管理</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <el-row v-else :gutter="24">
      <el-col v-for="school in schools" :key="school.id" :span="8">
        <el-card class="school-card" shadow="hover" @click="goToSchoolDetail(school.id)">
          <div class="school-header">
            <h3>{{ school.school_name }}</h3>
            <el-tag v-if="school.is_active" type="success" size="small">正常</el-tag>
            <el-tag v-else type="danger" size="small">已禁用</el-tag>
          </div>
          
          <div class="school-info">
            <p><strong>学校代码：</strong>{{ school.school_code }}</p>
            <p><strong>地区：</strong>{{ school.province }} {{ school.city }} {{ school.district }}</p>
          </div>
          
          <div class="school-stats">
            <div class="stat-item">
              <div class="stat-label">班级数</div>
              <div class="stat-value">{{ school.statistics.class_count }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">课程数</div>
              <div class="stat-value">{{ school.statistics.course_count }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">教师数</div>
              <div class="stat-value">{{ school.statistics.teacher_count }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">学生数</div>
              <div class="stat-value">{{ school.statistics.student_count }}</div>
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
import { getChannelSchools } from '@/api/channel'

const router = useRouter()
const loading = ref(true)
const schools = ref([])

const loadSchools = async () => {
  loading.value = true
  try {
    const response = await getChannelSchools()
    schools.value = response.data.data || []
  } catch (error) {
    console.error('加载学校列表失败:', error)
    ElMessage.error('加载学校列表失败')
  } finally {
    loading.value = false
  }
}

const goToSchoolDetail = (schoolId) => {
  router.push(`/channel/schools/${schoolId}`)
}

onMounted(() => loadSchools())
</script>

<style scoped lang="scss">
.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.school-card {
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  .school-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .school-info {
    margin-bottom: 16px;
    
    p {
      margin: 8px 0;
      font-size: 14px;
      color: #606266;
    }
  }
  
  .school-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    
    .stat-item {
      text-align: center;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;
      
      .stat-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 20px;
        font-weight: 600;
        color: #f5576c;
      }
    }
  }
}
</style>
